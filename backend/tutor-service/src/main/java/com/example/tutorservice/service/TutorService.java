package com.example.tutorservice.service;

import com.example.tutorservice.api.TutorProfileRequest;
import com.example.tutorservice.api.TutorProfileResponse;
import com.example.tutorservice.domain.TutorProfileEntity;
import com.example.tutorservice.repository.TutorProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class TutorService {
    private final TutorProfileRepository tutorProfileRepository;

    public TutorService(TutorProfileRepository tutorProfileRepository) {
        this.tutorProfileRepository = tutorProfileRepository;
    }

    @Transactional
    public TutorProfileResponse createOrUpdateProfile(Long currentUserId, TutorProfileRequest request) {
        if (!currentUserId.equals(request.userId())) {
            throw new SecurityException("You can only manage your own tutor profile");
        }

        Optional<TutorProfileEntity> existing = tutorProfileRepository.findByUserId(currentUserId);
        TutorProfileEntity profile = existing.orElseGet(TutorProfileEntity::new);

        profile.setUserId(request.userId());
        profile.setQualification(request.qualification().trim());
        profile.setSubject(request.subject().trim());
        profile.setLocation(request.location().trim());
        profile.setExperienceYears(request.experienceYears());
        profile.setBio(request.bio().trim());
        profile.setHourlyRate(request.hourlyRate());

        TutorProfileEntity saved = tutorProfileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TutorProfileResponse> searchTutors(String subject, String location, BigDecimal minRate, BigDecimal maxRate) {
        return tutorProfileRepository.findAll().stream()
                .filter(profile -> subject == null || subject.isBlank() || profile.getSubject().toLowerCase().contains(subject.toLowerCase()))
                .filter(profile -> location == null || location.isBlank() || profile.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(profile -> minRate == null || profile.getHourlyRate().compareTo(minRate) >= 0)
                .filter(profile -> maxRate == null || profile.getHourlyRate().compareTo(maxRate) <= 0)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TutorProfileResponse getProfile(Long id) {
        return tutorProfileRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Tutor profile not found"));
    }

    @Transactional(readOnly = true)
    public TutorProfileResponse getProfileByUserId(Long userId) {
        return tutorProfileRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Tutor profile not found"));
    }

    @Transactional(readOnly = true)
    public Optional<TutorProfileResponse> getMyProfile(Long userId) {
        return tutorProfileRepository.findByUserId(userId)
                .map(this::toResponse);
    }

    private TutorProfileResponse toResponse(TutorProfileEntity profile) {
        return new TutorProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getQualification(),
                profile.getSubject(),
                profile.getLocation(),
                profile.getExperienceYears(),
                profile.getBio(),
                profile.getHourlyRate(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
