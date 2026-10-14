# Architecture

The application follows a service-based design with independent microservices:

- Eureka Server: automatic service registration and discovery on port 8761
- API Gateway: routes requests on port 8080
- Auth Service: user registration, login, JWT and role management on port 8081
- Tutor Service: tutor profile storage and search on port 8082
- Booking Service: lesson booking, approval, completion and review flow on port 8083

Data ownership is separated as follows:
- Auth database: user accounts
- Tutor database: tutor profiles
- Booking database: bookings and reviews

The gateway does not replace service-level authorization; each protected backend service validates the JWT claims before serving requests.
