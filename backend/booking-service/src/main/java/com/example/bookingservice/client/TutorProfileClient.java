package com.example.bookingservice.client;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class TutorProfileClient {
    private final RestClient restClient;

    public TutorProfileClient(
            RestClient.Builder restClientBuilder,
            @Value("${tutor-service.base-url}") String tutorServiceBaseUrl) {
        this.restClient = restClientBuilder.baseUrl(tutorServiceBaseUrl).build();
    }

    public void validateTutorProfile(Long tutorUserId) {
        try {
            restClient.get()
                    .uri("/api/tutors/user/{userId}", tutorUserId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound exception) {
            throw new EntityNotFoundException("Tutor profile not found");
        } catch (RestClientException exception) {
            throw new IllegalStateException("Tutor service is unavailable; booking was not created", exception);
        }
    }
}
