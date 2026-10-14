package com.example.bookingservice.api;

import com.example.bookingservice.security.JwtPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {
    private final com.example.bookingservice.service.BookingService bookingService;

    public BookingController(com.example.bookingservice.service.BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createBooking(@AuthenticationPrincipal JwtPrincipal principal,
                                                       @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(principal.userId(), request));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<List<BookingResponse>> myBookings(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(bookingService.listStudentBookings(principal.userId()));
    }

    @GetMapping("/bookings/incoming")
    public ResponseEntity<List<BookingResponse>> incomingBookings(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(bookingService.listTutorBookings(principal.userId()));
    }

    @GetMapping("/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> allBookings() {
        return ResponseEntity.ok(bookingService.listAllBookings());
    }

    @PatchMapping("/admin/bookings/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> cancelBookingAsAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBookingAsAdmin(id));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(@AuthenticationPrincipal JwtPrincipal principal,
                                                      @PathVariable Long id,
                                                      @RequestBody BookingStatusRequest statusRequest) {
        return ResponseEntity.ok(bookingService.updateStatus(principal.userId(), id, statusRequest));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> createReview(@AuthenticationPrincipal JwtPrincipal principal,
                                                     @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(bookingService.createReview(principal.userId(), request));
    }
}
