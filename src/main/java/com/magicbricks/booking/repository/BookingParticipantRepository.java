package com.magicbricks.booking.repository;

import com.magicbricks.booking.domain.BookingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingParticipantRepository extends JpaRepository<BookingParticipant, Long> {
    List<BookingParticipant> findByBookingId(Long bookingId);
    void deleteByBookingId(Long bookingId);
}
