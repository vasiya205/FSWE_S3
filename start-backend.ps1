$ErrorActionPreference = "Stop"

foreach ($port in @(8761, 8080)) {
    if (-not (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)) {
        throw "Start Eureka on port 8761 and the API Gateway on port 8080 before running this script."
    }
}

$securePassword = Read-Host "PostgreSQL password (input is hidden)" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    $securePassword.Dispose()
}

$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
    $rng.GetBytes($bytes)
    $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
}
finally {
    $rng.Dispose()
    [Array]::Clear($bytes, 0, $bytes.Length)
}

$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_USERNAME = "postgres"

$logDirectory = Join-Path $env:TEMP ("home-tutor-finder-startup-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $logDirectory | Out-Null

try {
    foreach ($service in @(
        @{ Name = "auth-service"; Port = 8081 }
        @{ Name = "tutor-service"; Port = 8082 }
        @{ Name = "booking-service"; Port = 8083 }
    )) {
        $jarPath = Join-Path $PSScriptRoot "backend\$($service.Name)\target\$($service.Name)-1.0.0.jar"
        if (-not (Test-Path $jarPath)) {
            throw "Built service JAR not found: $jarPath. Build the backend first."
        }

        $jar = (Resolve-Path $jarPath).Path
        $process = Start-Process -FilePath "java.exe" `
            -ArgumentList ('-jar "{0}"' -f $jar) `
            -WorkingDirectory $PSScriptRoot `
            -RedirectStandardOutput (Join-Path $logDirectory "$($service.Name).log") `
            -RedirectStandardError (Join-Path $logDirectory "$($service.Name)-error.log") `
            -PassThru

        Write-Host "Waiting for $($service.Name) health check..."
        $deadline = (Get-Date).AddSeconds(90)
        $health = $null
        do {
            Start-Sleep -Seconds 2
            $process.Refresh()
            if ($process.HasExited) {
                Get-Content (Join-Path $logDirectory "$($service.Name).log") -Tail 25
                throw "$($service.Name) stopped during startup. Logs: $logDirectory"
            }

            try {
                $health = Invoke-WebRequest `
                    -Uri "http://localhost:$($service.Port)/actuator/health" `
                    -TimeoutSec 3 `
                    -UseBasicParsing
            }
            catch {
                $health = $null
            }
        } while ((-not $health -or $health.StatusCode -ne 200) -and (Get-Date) -lt $deadline)

        if (-not $health -or $health.StatusCode -ne 200) {
            Get-Content (Join-Path $logDirectory "$($service.Name).log") -Tail 25
            throw "$($service.Name) did not become healthy. Logs: $logDirectory"
        }

        Write-Host "$($service.Name) is healthy on port $($service.Port)."
    }

    $tutorSearch = Invoke-WebRequest `
        -Uri "http://localhost:8080/api/tutors/search" `
        -Headers @{ Origin = "http://localhost:5173" } `
        -TimeoutSec 10 `
        -UseBasicParsing

    if ($tutorSearch.StatusCode -ne 200) {
        throw "Tutor search returned HTTP $($tutorSearch.StatusCode). Logs: $logDirectory"
    }

    Write-Host "Tutor search is working (HTTP $($tutorSearch.StatusCode))."
    Write-Host "All backend services are running. Startup logs: $logDirectory"
}
finally {
    Remove-Item Env:DB_HOST, Env:DB_PORT, Env:DB_USERNAME, Env:DB_PASSWORD, Env:JWT_SECRET -ErrorAction SilentlyContinue
}
