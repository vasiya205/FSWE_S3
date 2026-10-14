package com.example.bookingservice.service;

import com.example.bookingservice.api.PaymentOrderResponse;
import com.example.bookingservice.api.PaymentStatusResponse;
import com.example.bookingservice.api.PaymentVerificationRequest;
import com.example.bookingservice.domain.BookingEntity;
import com.example.bookingservice.domain.BookingStatus;
import com.example.bookingservice.domain.PaymentStatus;
import com.example.bookingservice.repository.BookingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class PaymentService {
    private final BookingRepository bookingRepository;
    private final RestClient razorpayClient;
    private final String keyId;
    private final String keySecret;

    public PaymentService(
            BookingRepository bookingRepository,
            RestClient.Builder restClientBuilder,
            @Value("${razorpay.key-id:}") String keyId,
            @Value("${razorpay.key-secret:}") String keySecret) {
        this.bookingRepository = bookingRepository;
        this.razorpayClient = restClientBuilder.baseUrl("https://api.razorpay.com/v1").build();
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    @Transactional
    public PaymentOrderResponse createOrder(Long studentUserId, Long bookingId) {
        BookingEntity booking = findStudentBooking(studentUserId, bookingId);
        requireTestCredentials();
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only accepted bookings can be paid");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This booking is already paid");
        }
        if (booking.getTotalAmount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Free bookings do not require payment");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PENDING && booking.getRazorpayOrderId() != null) {
            return toOrderResponse(booking, booking.getRazorpayOrderId());
        }

        long amountInPaise = booking.getTotalAmount().movePointRight(2).longValueExact();
        RazorpayOrder order;
        try {
            order = razorpayClient.post()
                    .uri("/orders")
                    .headers(headers -> headers.setBasicAuth(keyId, keySecret))
                    .body(Map.of(
                            "amount", amountInPaise,
                            "currency", "INR",
                            "receipt", "booking-" + booking.getId(),
                            "notes", Map.of("bookingId", booking.getId().toString())
                    ))
                    .retrieve()
                    .body(RazorpayOrder.class);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Unable to create a Razorpay test order. Check the test credentials and try again.", exception);
        }
        if (order == null || order.id() == null || order.id().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay returned an invalid order");
        }

        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setRazorpayOrderId(order.id());
        booking.setRazorpayPaymentId(null);
        bookingRepository.save(booking);
        return toOrderResponse(booking, order.id());
    }

    @Transactional
    public PaymentStatusResponse verifyPayment(
            Long studentUserId, Long bookingId, PaymentVerificationRequest request) {
        BookingEntity booking = findStudentBooking(studentUserId, bookingId);
        requireTestCredentials();
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only accepted bookings can be paid");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID
                && request.paymentId().equals(booking.getRazorpayPaymentId())) {
            return toPaidResponse(booking);
        }
        if (booking.getPaymentStatus() != PaymentStatus.PENDING
                || !request.orderId().equals(booking.getRazorpayOrderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment order does not match this booking");
        }

        if (!RazorpaySignatureVerifier.isValid(keySecret, request.orderId(), request.paymentId(), request.signature())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment signature is invalid");
        }

        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setRazorpayPaymentId(request.paymentId());
        bookingRepository.save(booking);
        return toPaidResponse(booking);
    }

    private BookingEntity findStudentBooking(Long studentUserId, Long bookingId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        if (!studentUserId.equals(booking.getStudentUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only pay for your own bookings");
        }
        return booking;
    }

    private void requireTestCredentials() {
        if (keyId == null || !keyId.startsWith("rzp_test_") || keySecret == null || keySecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Razorpay test credentials are not configured. Set a rotated test key and secret locally.");
        }
    }

    private PaymentOrderResponse toOrderResponse(BookingEntity booking, String orderId) {
        return new PaymentOrderResponse(
                booking.getId(), keyId, orderId,
                booking.getTotalAmount().movePointRight(2).longValueExact(),
                "INR", booking.getTotalAmount(), "TEST");
    }

    private PaymentStatusResponse toPaidResponse(BookingEntity booking) {
        return new PaymentStatusResponse(
                booking.getId(), booking.getTotalAmount(), PaymentStatus.PAID.name(),
                booking.getRazorpayPaymentId(), "Test payment verified; no real money was charged or transferred.");
    }

    private record RazorpayOrder(String id) {}
}
