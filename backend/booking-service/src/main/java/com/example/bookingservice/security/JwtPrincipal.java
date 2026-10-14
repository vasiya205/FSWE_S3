package com.example.bookingservice.security;

public record JwtPrincipal(Long userId, String email, String role) {}
