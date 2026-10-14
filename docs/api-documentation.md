# API Documentation

All API requests can be sent through the API Gateway at `http://localhost:8080`.

## Authentication endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/admin/users` (Admin)
- `PATCH /api/auth/admin/users/{userId}/enabled` (Admin)

Protected endpoints use `Authorization: Bearer <JWT>`.

## Tutor endpoints

- `GET /api/tutors/search`
- `GET /api/tutors/{id}`
- `GET /api/tutors/user/{userId}`
- `GET /api/tutors/me` (Tutor)
- `POST /api/tutors/profile` (Tutor)

## Booking and review endpoints

- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/incoming`
- `PATCH /api/bookings/{id}/status`
- `GET /api/admin/bookings` (Admin)
- `PATCH /api/admin/bookings/{id}/cancel` (Admin)
- `POST /api/reviews`

Booking creation accepts the tutor user ID, subject, start/end date-time, and lesson notes. The backend reads the tutor's saved rate and calculates the total; clients cannot choose the price.

## Sandbox payment endpoints

- `POST /api/bookings/{id}/payments/order`
- `POST /api/bookings/{id}/payments/verify`

Only the student who owns an accepted booking can create or verify its payment. Verification requires the Razorpay order ID, payment ID, and signature. These endpoints use Razorpay test credentials supplied locally; no real charge or tutor payout is made.

## Postman

Import `postman/Home-Tutor-Finder.postman_collection.json` and `postman/Home-Tutor-Finder-Local.postman_environment.json` into Postman and keep the API Gateway running at `http://localhost:8080`. Select the `Home Tutor Finder - Local` environment before sending requests. Enter login credentials as local environment values; the login requests store the returned JWT in the environment's `token` variable. Do not export or commit an environment after entering credentials, and never put payment keys or generated tokens in GitHub.

Log in as the student, tutor, or admin account before running requests that require that role. The payment order request requires an accepted unpaid booking. To complete sandbox payment verification, use the payment ID and signature returned by the real Razorpay test checkout on the website; do not fabricate these values.
