package com.example.bookingservice.client;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class TutorProfileClient {
    private final RestClient restClient;

    public TutorProfileClient(
            RestClient.Builder restClientBuilder,
            @Value("${tutor-service.base-url}") String tutorServiceBaseUrl) {
        this.restClient = restClientBuilder.baseUrl(tutorServiceBaseUrl).build();
    }

    public TutorProfile getTutorProfile(Long tutorUserId) {
        try {
            TutorProfile profile = restClient.get()
                    .uri("/api/tutors/user/{userId}", tutorUserId)
                    .retrieve()
                    .body(TutorProfile.class);
            if (profile == null) {
                throw new IllegalStateException("Tutor service returned an empty profile");
            }
            return profile;
        } catch (HttpClientErrorException.NotFound exception) {
            throw new EntityNotFoundException("Tutor profile not found");
        } catch (RestClientException exception) {
            throw new IllegalStateException("Tutor service is unavailable; booking was not created", exception);
        }
    }

    public record TutorProfile(
            Long id,
            Long userId,
            String qualification,
            String subject,
            String location,
            Integer experienceYears,
            String bio,
            BigDecimal hourlyRate,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {}
}
