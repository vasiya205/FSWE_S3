# API Documentation

## Auth endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

## Tutor endpoints
- GET /api/tutors/search
- GET /api/tutors/{id}
- GET /api/tutors/me
- POST /api/tutors/profile

## Booking endpoints
- POST /api/bookings
- GET /api/bookings/my
- GET /api/bookings/incoming
- PATCH /api/bookings/{id}/status
- POST /api/reviews

Authentication uses the Authorization header: Bearer <JWT>.
