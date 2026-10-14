package com.example.bookingservice.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BookingRequest(
    @NotNull(message = "Tutor user id is required") Long tutorUserId,
    @NotBlank(message = "Subject is required") String subject,
    @NotNull(message = "Start time is required") LocalDateTime startDateTime,
    @NotNull(message = "End time is required") LocalDateTime endDateTime,
    @NotBlank(message = "Notes are required") String notes
) {}
