package com.example.bookingservice.service;

import com.example.bookingservice.api.BookingRequest;
import com.example.bookingservice.api.BookingResponse;
import com.example.bookingservice.api.BookingStatusRequest;
import com.example.bookingservice.api.ReviewRequest;
import com.example.bookingservice.api.ReviewResponse;
import com.example.bookingservice.client.TutorProfileClient;
import com.example.bookingservice.domain.BookingEntity;
import com.example.bookingservice.domain.BookingStatus;
import com.example.bookingservice.domain.ReviewEntity;
import com.example.bookingservice.repository.BookingRepository;
import com.example.bookingservice.repository.ReviewRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final TutorProfileClient tutorProfileClient;

    public BookingService(BookingRepository bookingRepository, ReviewRepository reviewRepository,
                          TutorProfileClient tutorProfileClient) {
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.tutorProfileClient = tutorProfileClient;
    }

    @Transactional
    public BookingResponse createBooking(Long studentUserId, BookingRequest request) {
        if (studentUserId.equals(request.tutorUserId())) {
            throw new IllegalArgumentException("Students cannot book their own profile");
        }
        tutorProfileClient.validateTutorProfile(request.tutorUserId());
        if (!request.startDateTime().isBefore(request.endDateTime())) {
            throw new IllegalArgumentException("Booking end time must be after start time");
        }

        for (BookingEntity booking : bookingRepository.findByTutorUserId(request.tutorUserId())) {
            boolean isOverlap = !booking.getEndDateTime().isBefore(request.startDateTime()) && !booking.getStartDateTime().isAfter(request.endDateTime());
            boolean active = booking.getStatus() != BookingStatus.CANCELLED && booking.getStatus() != BookingStatus.REJECTED;
            if (active && isOverlap) {
                throw new IllegalArgumentException("The tutor already has a booking during that time");
            }
        }

        BookingEntity booking = new BookingEntity(
                studentUserId,
                request.tutorUserId(),
                request.subject(),
                request.startDateTime(),
                request.endDateTime(),
                request.notes(),
                request.hourlyRate()
        );
        BookingEntity saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listStudentBookings(Long studentUserId) {
        return bookingRepository.findByStudentUserId(studentUserId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listTutorBookings(Long tutorUserId) {
        return bookingRepository.findByTutorUserId(tutorUserId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public BookingResponse cancelBookingAsAdmin(Long bookingId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new IllegalArgumentException("Only pending or accepted bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateStatus(Long userId, Long bookingId, BookingStatusRequest request) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        BookingStatus nextStatus = BookingStatus.valueOf(request.status().trim().toUpperCase());
        if (userId.equals(booking.getStudentUserId()) && nextStatus == BookingStatus.CANCELLED) {
            booking.setStatus(nextStatus);
            return toResponse(bookingRepository.save(booking));
        }

        if (userId.equals(booking.getTutorUserId()) && (nextStatus == BookingStatus.ACCEPTED || nextStatus == BookingStatus.REJECTED || nextStatus == BookingStatus.COMPLETED)) {
            if (nextStatus == BookingStatus.COMPLETED && booking.getStatus() != BookingStatus.ACCEPTED) {
                throw new IllegalArgumentException("Only accepted bookings can be completed");
            }
            booking.setStatus(nextStatus);
            return toResponse(bookingRepository.save(booking));
        }

        throw new SecurityException("You are not allowed to change this booking");
    }

    @Transactional
    public ReviewResponse createReview(Long studentUserId, ReviewRequest request) {
        BookingEntity booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!studentUserId.equals(booking.getStudentUserId())) {
            throw new SecurityException("Students can only review their own bookings");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Only completed bookings can be reviewed");
        }
        if (!request.tutorUserId().equals(booking.getTutorUserId())) {
            throw new IllegalArgumentException("Tutor mismatch");
        }

        ReviewEntity review = new ReviewEntity(
                booking.getId(),
                studentUserId,
                booking.getTutorUserId(),
                request.rating(),
                request.comment().trim()
        );
        ReviewEntity saved = reviewRepository.save(review);
        return new ReviewResponse(saved.getId(), saved.getBookingId(), saved.getStudentUserId(), saved.getTutorUserId(), saved.getRating(), saved.getComment(), saved.getCreatedAt());
    }

    private BookingResponse toResponse(BookingEntity booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getStudentUserId(),
                booking.getTutorUserId(),
                booking.getSubject(),
                booking.getStartDateTime(),
                booking.getEndDateTime(),
                booking.getNotes(),
                booking.getHourlyRate(),
                booking.getStatus().name(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
