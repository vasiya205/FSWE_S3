package com.example.tutorservice.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TutorProfileRequest(
    @NotNull(message = "Tutor user ID is required") Long userId,
    @NotBlank(message = "Qualification is required") String qualification,
    @NotBlank(message = "Subject is required") String subject,
    @NotBlank(message = "Location is required") String location,
    @NotNull(message = "Experience is required") Integer experienceYears,
    @NotBlank(message = "Bio is required") String bio,
    @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal hourlyRate
) {}
