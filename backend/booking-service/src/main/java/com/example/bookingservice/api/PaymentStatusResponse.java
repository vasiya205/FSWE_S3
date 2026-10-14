package com.example.bookingservice.api;

import java.math.BigDecimal;

public record PaymentStatusResponse(
        Long bookingId,
        BigDecimal totalAmount,
        String paymentStatus,
        String paymentId,
        String message
) {}
