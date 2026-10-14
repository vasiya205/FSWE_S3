# Home Tutor Finder

This project is a full-stack application for discovering home tutors and managing bookings.

## Stack
- Frontend: React + Vite + JavaScript
- Backend: Spring Boot 3.x + Java 21
- Service discovery: Eureka
- API routing: Spring Cloud Gateway
- Security: JWT + Spring Security + BCrypt
- Database: PostgreSQL, managed locally with PostgreSQL Server and pgAdmin 4

## Features
- Student, Tutor and Admin role separation
- Tutor profile creation and editing from the tutor dashboard, plus public tutor search
- Booking creation and status management
- Razorpay sandbox checkout for accepted lessons, with server-side signature verification
- Admin dashboard for reviewing users/bookings, disabling or re-enabling accounts, and cancelling active bookings
- Review creation after completed lessons
- JWT auth and protected endpoints

## Rubric alignment checklist
This project is already structured to meet the evaluation rubric for a full-stack web development project:

- Frontend development: responsive pages, role-aware dashboard, tutor discovery flow, booking form, and clean navigation
- Backend development: Spring Boot microservices for auth, tutors, and bookings with API separation and protected endpoints
- Database management: PostgreSQL-backed services using distinct schemas for `auth_db`, `tutor_db`, and `booking_db`
- Security: JWT-based authentication, BCrypt password encoding, stateless sessions, and protected service APIs
- Payments: test-mode checkout records a verified test payment; it does not charge a real card or transfer money to a tutor
- Administration: admin-only management APIs; public registration cannot assign the Admin role
- Application flow: end-to-end student/tutor flow from registration/login to tutor view and booking request
- Repository quality: organized Maven multi-module backend, Vite frontend, and project-level startup scripts

## Step-by-step completion plan
1. Install Java 21, Maven, Node.js, PostgreSQL, and pgAdmin, then open the extracted project root.
2. Create the PostgreSQL databases: `auth_db`, `tutor_db`, and `booking_db`.
3. Run the matching schema scripts from `database/` before starting any service.
4. Start the backend in order: Eureka, Auth Service, Tutor Service, Booking Service, API Gateway.
5. Start the frontend with `npm.cmd --prefix frontend run dev` and test the app at `http://localhost:5173`.
6. Final checklist before submission:
   - Frontend works on desktop/mobile screens
   - Auth, tutor search, booking, and sandbox payment flow work end-to-end
   - JWT security is active and protected endpoints require authentication
   - GitHub repository is valid, organized, and accessible
   - MOOCS course is completed and linked where required
   - LinkedIn article is published with the required quality and URL is ready for submission

## Start on another Windows laptop

1. Install **64-bit Java Development Kit 21**, **Apache Maven 3.9 or newer**, **Node.js 20.19 or newer (or 22.12 or newer)**, and **PostgreSQL Server**. Add Java, Maven's `bin` folder, and Node.js to `PATH`. To install Maven with WinGet, run `winget install --id Apache.Maven --exact` in PowerShell, then close and reopen VS Code so its terminals pick up the updated `PATH`. Alternatively, download the Apache Maven binary ZIP, extract it, and add its `bin` folder to your user `PATH`. Install pgAdmin 4 if you want to manage PostgreSQL with its GUI.
2. Extract the ZIP. In VS Code, open the extracted **project root**: the folder containing `README.md` and the `backend`, `database`, and `frontend` folders. If the extracted folder contains another `home-tutor-finder` folder, open that inner folder; running commands one level above it will not find `backend\pom.xml`. Do not open the ZIP itself. All commands below are PowerShell commands run from this project root unless a step says otherwise.
3. Open a new VS Code PowerShell terminal and verify the tools are available:

   ```powershell
   java -version
   mvn.cmd -version
   node --version
   npm.cmd --version
   ```

   Java must report version 21. The frontend dependencies are restored from the included `frontend/package-lock.json`; generated `node_modules` and Maven `target` folders are not needed in the ZIP.
4. Start PostgreSQL Server and create the three databases and schemas as described below.
5. Build and start the backend services as described below, then start the frontend. Keep each service terminal open while using the app.

### Create PostgreSQL databases and tables

pgAdmin 4 is a management client; it is not the PostgreSQL database server. Register/connect to the local server (typically `localhost`, port `5432`, username `postgres`) using the password chosen during PostgreSQL installation.

1. Start PostgreSQL Server. You can set up the databases and schemas automatically by opening PowerShell at the project root and running `.\database\setup-postgresql.ps1`. The script prompts for the `postgres` password without displaying it, creates only missing databases, and applies each schema to its matching database without deleting existing records. Alternatively, use the manual steps below.
2. In pgAdmin, create three databases: `auth_db`, `tutor_db`, and `booking_db`. Use the `postgres` role as owner unless your local setup uses a dedicated role.
3. Open Query Tool for `auth_db` and run `database/auth-schema.sql`. Repeat in `tutor_db` with `database/tutor-schema.sql` and in `booking_db` with `database/booking-schema.sql`. Do not run all three scripts against one database.
4. `database/schema.sql` is retained as a pointer to the separated PostgreSQL scripts; it is not an executable schema.
5. The Hibernate setting is `ddl-auto: validate`: services check that the tables match the mappings but do not create, drop, or migrate tables. SQL initialization is disabled. Apply the schema scripts before starting the services. Re-running them is safe for existing tables and does not delete data.
6. There is no seed user script. Register through the app/API so passwords are stored using BCrypt, not as plaintext. Public registration only allows Student and Tutor accounts. To provision the initial Admin, register the intended account, then in pgAdmin's Query Tool connected to `auth_db`, run `UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';` with that account's exact email. Sign out and back in to receive a token with the Admin role. Keep the database password private and only promote an account you control.
7. Admins can manage accounts and active bookings in the Admin dashboard. Disabling an account blocks future logins and Auth Service requests; already-issued JWTs may remain usable by other services until their 10-hour expiry.

The services each own one database:

- Auth Service: `auth_db` (`users`)
- Tutor Service: `tutor_db` (`tutor_profiles`)
- Booking Service: `booking_db` (`bookings`, `reviews`)

User and tutor IDs in the Tutor and Booking databases are references owned by other services, so they intentionally do not have cross-database foreign keys. The Tutor Service binds profile writes to the authenticated JWT user. Before storing a booking, the Booking Service checks the tutor user ID through the Tutor Service REST API (`/api/tutors/user/{userId}`); if that service is unavailable or the profile does not exist, the booking is rejected. The Booking database also enforces the review-to-booking foreign key locally.

## Configure local environment variables

Do not put real credentials or JWT secrets in source files or commit them. Generate one random signing secret once in a PowerShell terminal:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)
$rng.Dispose()
$jwtSecret
```

Copy the generated value for use in each backend terminal. In each VS Code PowerShell terminal used to run a backend service, set:

```powershell
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_USERNAME = "postgres"
$securePassword = Read-Host "PostgreSQL password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}
$env:JWT_SECRET = "paste-the-same-generated-secret-here"
```

The JWT secret line is a placeholder; substitute the same generated secret in every backend service terminal. The password prompt hides your input. Set `TUTOR_SERVICE_URL` in the Booking Service terminal only if the Tutor Service is not at its local default. The application requires `DB_PASSWORD` and `JWT_SECRET`; it does not fall back to H2 or a development signing secret.

For manually starting the Booking Service, also set `RAZORPAY_KEY_ID` to your rotated Razorpay test key ID and set `RAZORPAY_KEY_SECRET` to its test secret. Keep both local, never commit them, and use a key ID beginning with `rzp_test_`. The recommended `start-backend.ps1` script prompts for these values instead of saving them in files.

## Build and run in VS Code

Ensure PostgreSQL is running with all three databases and schemas set up. Open a separate integrated PowerShell terminal for each service. Environment variables are local to each terminal, so set them in every backend-service terminal before starting its service.

From the project root, build all backend services:

```powershell
mvn.cmd -f backend\pom.xml clean package
```

Run each command in its own terminal, from the project root. Set the environment variables above in each terminal, then start the services in this order. Keep each terminal open:

```powershell
mvn.cmd -f backend\pom.xml -pl eureka-server spring-boot:run
```

```powershell
mvn.cmd -f backend\pom.xml -pl auth-service spring-boot:run
```

```powershell
mvn.cmd -f backend\pom.xml -pl tutor-service spring-boot:run
```

```powershell
mvn.cmd -f backend\pom.xml -pl booking-service spring-boot:run
```

```powershell
mvn.cmd -f backend\pom.xml -pl api-gateway spring-boot:run
```

On Windows, after building and setting up PostgreSQL, you can instead run Eureka and the API Gateway in their own terminals, then start the three database-backed services together from the project root:

```powershell
.\start-backend.ps1
```

The script asks for the PostgreSQL password and a Razorpay **test** key ID/secret locally, generates one JWT secret shared by all three services, waits for their health checks, and verifies tutor search through the API Gateway. It only accepts a key ID beginning with `rzp_test_`; never use live credentials for this project demo. Rotate any credentials exposed in screenshots or messages before using them, and do not commit credentials. The script does not create databases or change schemas; set those up first. Startup logs are written to a uniquely named folder under your Windows temporary directory. Restarting the script generates a new JWT secret, so sign in again after a restart.

### Demonstrate a sandbox lesson payment

The student can pay for an accepted booking from the dashboard. The fee is calculated by the backend from the tutor's saved hourly rate and booking duration; the client cannot set the price. Razorpay's test checkout and the server-verified payment signature update the booking to `PAID`. This is a demonstration only: no real money is charged and no payout is transferred to a tutor. For an existing database, rerun `database/setup-postgresql.ps1` after stopping the services; its booking schema safely adds the payment columns and calculates totals for existing bookings.

Start the frontend in another terminal from the project root:

```powershell
npm.cmd --prefix frontend ci
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend run dev
```

Open `http://localhost:5173`. The frontend calls the API Gateway at `http://localhost:8080`.

## Verify PostgreSQL tables

In pgAdmin, expand each database, then **Schemas > public > Tables** and refresh. You should see:

- `auth_db`: `users`
- `tutor_db`: `tutor_profiles`
- `booking_db`: `bookings`, `reviews`

Check each service startup log for a successful datasource/JPA initialization. A missing database, wrong password, or schema mismatch is a startup error; fix the PostgreSQL setup rather than switching back to H2.
