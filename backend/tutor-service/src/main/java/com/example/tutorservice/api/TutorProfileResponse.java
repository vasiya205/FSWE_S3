package com.example.tutorservice.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TutorProfileResponse(
    Long id,
    Long userId,
    String qualification,
    String subject,
    String location,
    Integer experienceYears,
    String bio,
    BigDecimal hourlyRate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
