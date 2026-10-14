package com.example.authservice.api;

import jakarta.validation.constraints.NotNull;

public record AccountEnabledRequest(@NotNull Boolean enabled) {}
