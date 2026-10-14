package com.example.tutorservice.security;

public record JwtPrincipal(Long userId, String email, String role) {}
