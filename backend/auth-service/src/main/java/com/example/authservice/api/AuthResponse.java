package com.example.authservice.api;

public record AuthResponse(
    Long userId,
    String fullName,
    String email,
    String role,
    String token
) {}
