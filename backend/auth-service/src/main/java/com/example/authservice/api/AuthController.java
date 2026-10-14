package com.example.authservice.api;

import com.example.authservice.domain.UserEntity;
import com.example.authservice.api.AccountEnabledRequest;
import com.example.authservice.api.AdminUserResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final com.example.authservice.service.AuthService authService;

    public AuthController(com.example.authservice.service.AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummary> me(@AuthenticationPrincipal UserEntity user) {
        return ResponseEntity.ok(authService.currentUser(user.getId()));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserResponse>> listUsers() {
        return ResponseEntity.ok(authService.listUsers());
    }

    @PatchMapping("/admin/users/{userId}/enabled")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> setAccountEnabled(
            @AuthenticationPrincipal UserEntity admin,
            @PathVariable Long userId,
            @Valid @RequestBody AccountEnabledRequest request) {
        return ResponseEntity.ok(authService.setAccountEnabled(admin.getId(), userId, request.enabled()));
    }
}
