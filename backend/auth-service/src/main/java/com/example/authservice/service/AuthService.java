package com.example.authservice.service;

import com.example.authservice.api.AuthResponse;
import com.example.authservice.api.AdminUserResponse;
import com.example.authservice.api.LoginRequest;
import com.example.authservice.api.RegisterRequest;
import com.example.authservice.api.UserSummary;
import com.example.authservice.domain.Role;
import com.example.authservice.domain.UserEntity;
import com.example.authservice.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role role = request.role() == null ? Role.STUDENT : request.role();
        if (role == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin accounts must be provisioned by a database administrator");
        }
        UserEntity user = new UserEntity(
                request.fullName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                role
        );

        UserEntity saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);
        return new AuthResponse(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole().name(), token);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.email().trim())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is disabled");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), token);
    }

    @Transactional(readOnly = true)
    public UserSummary currentUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.isEnabled(),
                        user.getCreatedAt()))
                .toList();
    }

    @Transactional
    public AdminUserResponse setAccountEnabled(Long adminUserId, Long targetUserId, boolean enabled) {
        UserEntity target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!enabled && adminUserId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot disable your own admin account");
        }
        if (!enabled && target.getRole() == Role.ADMIN && target.isEnabled()
                && userRepository.countByRoleAndEnabledTrue(Role.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The last enabled admin account cannot be disabled");
        }

        target.setEnabled(enabled);
        UserEntity saved = userRepository.save(target);
        return new AdminUserResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.isEnabled(),
                saved.getCreatedAt());
    }
}
