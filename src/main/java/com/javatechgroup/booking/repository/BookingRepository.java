package com.javatechgroup.booking.repository;

import com.javatechgroup.booking.domain.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBookerId(Long bookerId);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.status = 'CONFIRMED' " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(@Param("roomId") Long roomId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.id <> :bookingId AND b.status = 'CONFIRMED' " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookingsExcludingSelf(@Param("roomId") Long roomId,
                                                       @Param("bookingId") Long bookingId,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime);

    @Query(value = "SELECT b FROM Booking b LEFT JOIN FETCH b.room r LEFT JOIN FETCH b.booker u LEFT JOIN FETCH u.department d " +
                   "WHERE b.company.id = :companyId " +
                   "AND (:roomId IS NULL OR r.id = :roomId) " +
                   "AND (:floor = 'ALL' OR r.floor = :floor) " +
                   "AND (:status = 'ALL' " +
                   "     OR (:status = 'CANCELLED' AND b.status = 'CANCELLED') " +
                   "     OR ((:status = 'CONFIRMED' OR :status = 'UPCOMING') AND b.status = 'CONFIRMED' AND b.startTime > :now) " +
                   "     OR (:status = 'IN_PROGRESS' AND b.status = 'CONFIRMED' AND b.startTime <= :now AND b.endTime >= :now) " +
                   "     OR (:status = 'COMPLETED' AND b.status = 'CONFIRMED' AND b.endTime < :now) " +
                   "     OR b.status = :status) " +
                   "AND (:bookerId IS NULL OR u.id = :bookerId) " +
                   "AND (:startTimeFrom IS NULL OR b.startTime >= :startTimeFrom) " +
                   "AND (:startTimeTo IS NULL OR b.startTime <= :startTimeTo) " +
                   "AND (:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(b) FROM Booking b LEFT JOIN b.room r LEFT JOIN b.booker u " +
                   "WHERE b.company.id = :companyId " +
                   "AND (:roomId IS NULL OR r.id = :roomId) " +
                   "AND (:floor = 'ALL' OR r.floor = :floor) " +
                   "AND (:status = 'ALL' " +
                   "     OR (:status = 'CANCELLED' AND b.status = 'CANCELLED') " +
                   "     OR ((:status = 'CONFIRMED' OR :status = 'UPCOMING') AND b.status = 'CONFIRMED' AND b.startTime > :now) " +
                   "     OR (:status = 'IN_PROGRESS' AND b.status = 'CONFIRMED' AND b.startTime <= :now AND b.endTime >= :now) " +
                   "     OR (:status = 'COMPLETED' AND b.status = 'CONFIRMED' AND b.endTime < :now) " +
                   "     OR b.status = :status) " +
                   "AND (:bookerId IS NULL OR u.id = :bookerId) " +
                   "AND (:startTimeFrom IS NULL OR b.startTime >= :startTimeFrom) " +
                   "AND (:startTimeTo IS NULL OR b.startTime <= :startTimeTo) " +
                   "AND (:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Booking> searchBookings(
            @Param("companyId") Long companyId,
            @Param("roomId") Long roomId,
            @Param("floor") String floor,
            @Param("status") String status,
            @Param("bookerId") Long bookerId,
            @Param("startTimeFrom") LocalDateTime startTimeFrom,
            @Param("startTimeTo") LocalDateTime startTimeTo,
            @Param("search") String search,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    @Query("SELECT b FROM Booking b WHERE b.company.id = :companyId AND b.status = 'CONFIRMED' " +
           "AND b.startTime <= :now AND b.endTime >= :now")
    List<Booking> findCurrentlyActiveBookings(@Param("companyId") Long companyId, @Param("now") LocalDateTime now);

    @Query("SELECT b FROM Booking b WHERE b.company.id = :companyId " +
           "AND b.startTime >= :dayStart AND b.startTime < :dayEnd")
    List<Booking> findBookingsForDay(@Param("companyId") Long companyId,
                                     @Param("dayStart") LocalDateTime dayStart,
                                     @Param("dayEnd") LocalDateTime dayEnd);
}
