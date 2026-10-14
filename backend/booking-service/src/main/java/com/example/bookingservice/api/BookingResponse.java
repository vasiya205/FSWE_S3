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
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
