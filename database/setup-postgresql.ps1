$ErrorActionPreference = "Stop"

$databaseRoot = $PSScriptRoot
$projectRoot = Split-Path -Parent $databaseRoot
$psqlCommand = Get-Command psql.exe -ErrorAction SilentlyContinue

if ($psqlCommand) {
    $psqlPath = $psqlCommand.Source
}
else {
    $postgresInstallations = Join-Path $env:ProgramFiles "PostgreSQL"
    $psqlPath = Get-ChildItem -Path $postgresInstallations -Filter psql.exe -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.Directory.Name -eq "bin" } |
        Sort-Object FullName -Descending |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $psqlPath) {
    throw "Could not find psql.exe. Install PostgreSQL command-line tools or add PostgreSQL's bin folder to PATH."
}

$databaseSchemas = @(
    @{ Name = "auth_db"; Schema = "auth-schema.sql" }
    @{ Name = "tutor_db"; Schema = "tutor-schema.sql" }
    @{ Name = "booking_db"; Schema = "booking-schema.sql" }
)

function Invoke-PostgresCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Database,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $output = & $psqlPath --no-psqlrc --host localhost --port 5432 --username postgres --dbname $Database --no-password --set ON_ERROR_STOP=1 @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL command failed for database '$Database':`n$($output -join [Environment]::NewLine)"
    }

    return $output
}

$securePassword = Read-Host "PostgreSQL password for user 'postgres' (input is hidden)" -AsSecureString
$passwordPointer = [IntPtr]::Zero

try {
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    foreach ($entry in $databaseSchemas) {
        $exists = Invoke-PostgresCommand -Database "postgres" -Arguments @(
            "--tuples-only",
            "--no-align",
            "--command",
            "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = '$($entry.Name)')"
        )

        if (($exists -join "").Trim() -ne "t") {
            Invoke-PostgresCommand -Database "postgres" -Arguments @("--command", "CREATE DATABASE $($entry.Name)") | Out-Null
            Write-Host "Created database $($entry.Name)."
        }
        else {
            Write-Host "Database $($entry.Name) already exists; preserving its data."
        }

        $schemaPath = Join-Path $databaseRoot $entry.Schema
        if (-not (Test-Path -LiteralPath $schemaPath)) {
            throw "Schema file not found: $schemaPath"
        }

        Invoke-PostgresCommand -Database $entry.Name -Arguments @("--file", $schemaPath) | Out-Null
        Write-Host "Applied $($entry.Schema) to $($entry.Name)."
    }

    Write-Host ""
    Write-Host "Project databases are ready. Existing records were not deleted."
    Write-Host "Verify the tables in pgAdmin under each database > Schemas > public > Tables."
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    $securePassword.Dispose()
}
