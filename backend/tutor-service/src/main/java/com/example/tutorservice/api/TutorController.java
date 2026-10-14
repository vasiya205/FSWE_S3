package com.example.tutorservice.api;

import com.example.tutorservice.security.JwtPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {
    private final com.example.tutorservice.service.TutorService tutorService;

    public TutorController(com.example.tutorservice.service.TutorService tutorService) {
        this.tutorService = tutorService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<TutorProfileResponse>> search(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minRate,
            @RequestParam(required = false) BigDecimal maxRate) {
        return ResponseEntity.ok(tutorService.searchTutors(subject, location, minRate, maxRate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutorProfileResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tutorService.getProfile(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<TutorProfileResponse> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(tutorService.getProfileByUserId(userId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<TutorProfileResponse> myProfile(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.of(tutorService.getMyProfile(principal.userId()));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<TutorProfileResponse> upsertProfile(@Valid @RequestBody TutorProfileRequest request,
                                                            @AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(tutorService.createOrUpdateProfile(principal.userId(), request));
    }
}
