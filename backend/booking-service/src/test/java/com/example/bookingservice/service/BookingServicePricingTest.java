package com.example.bookingservice.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BookingServicePricingTest {
    private static final LocalDateTime START = LocalDateTime.of(2026, 10, 15, 10, 0);

    @Test
    void calculatesTotalForOneHour() {
        assertEquals(new BigDecimal("800.00"),
                BookingService.calculateTotalAmount(new BigDecimal("800.00"), START, START.plusHours(1)));
    }

    @Test
    void calculatesAndRoundsPartialHourToPaise() {
        assertEquals(new BigDecimal("50.01"),
                BookingService.calculateTotalAmount(new BigDecimal("100.01"), START, START.plusMinutes(30)));
    }
}
