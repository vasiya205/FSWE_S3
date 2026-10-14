package com.example.bookingservice.api;

import java.math.BigDecimal;

public record PaymentOrderResponse(
        Long bookingId,
        String keyId,
        String orderId,
        long amount,
        String currency,
        BigDecimal totalAmount,
        String mode
) {}
