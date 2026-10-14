package com.example.authservice.api;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        boolean enabled,
        LocalDateTime createdAt
) {}
