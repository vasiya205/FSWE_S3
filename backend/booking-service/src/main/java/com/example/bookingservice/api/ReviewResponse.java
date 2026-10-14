package com.example.bookingservice.api;

import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    Long bookingId,
    Long studentUserId,
    Long tutorUserId,
    Integer rating,
    String comment,
    LocalDateTime createdAt
) {}
