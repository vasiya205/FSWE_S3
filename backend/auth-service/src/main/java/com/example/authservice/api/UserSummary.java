package com.example.authservice.api;

public record UserSummary(
    Long id,
    String fullName,
    String email,
    String role
) {}
