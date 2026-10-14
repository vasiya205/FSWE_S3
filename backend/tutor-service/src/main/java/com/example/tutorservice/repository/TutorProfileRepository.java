package com.example.tutorservice.repository;

import com.example.tutorservice.domain.TutorProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TutorProfileRepository extends JpaRepository<TutorProfileEntity, Long> {
    Optional<TutorProfileEntity> findByUserId(Long userId);
}
