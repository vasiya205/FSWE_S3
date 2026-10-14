package com.example.bookingservice.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
    Long id,
    Long studentUserId,
    Long tutorUserId,
    String subject,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    String notes,
    BigDecimal hourlyRate,
    BigDecimal totalAmount,
    String status,
    String paymentStatus,
    String paymentReference,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
