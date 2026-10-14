package com.example.bookingservice.repository;

import com.example.bookingservice.domain.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    List<BookingEntity> findByStudentUserId(Long studentUserId);
    List<BookingEntity> findByTutorUserId(Long tutorUserId);
}
