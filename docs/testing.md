# Testing Checklist

- Backend services start individually with Maven
- API Gateway forwards requests to downstream services
- Register and login flow creates a valid JWT and returns user details
- Tutor search returns a filtered list
- Student can create a booking for an available time slot
- Tutor can accept or reject a booking
- Completed bookings can receive a review
- Frontend build succeeds with npm production build
