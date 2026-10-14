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
- POST /api/bookings/{id}/payments/order
- POST /api/bookings/{id}/payments/verify
- POST /api/reviews

Booking creation accepts the tutor user ID, subject, start/end date-time, and lesson notes. The backend reads the tutor's saved rate and calculates the total; clients cannot choose the price. Accepted student bookings can be paid using Razorpay test checkout. The verify endpoint requires the Razorpay order ID, payment ID, and signature, and only the booking's student can create or verify payment.

Authentication uses the Authorization header: Bearer <JWT>. Payment endpoints are sandbox-only and require local `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` values; no actual charge or tutor payout is made.
