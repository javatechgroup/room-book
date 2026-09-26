package com.javatechgroup.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.javatechgroup.booking.domain.Booking;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.Room;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.dto.BookingRequest;
import com.javatechgroup.booking.dto.BookingResponse;
import com.javatechgroup.booking.common.BookingConflictException;
import com.javatechgroup.booking.repository.BookingRepository;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.RoomRepository;
import com.javatechgroup.booking.repository.UserRepository;
import com.javatechgroup.booking.service.FacilityBookingService;

@SpringBootTest
public class RecurringBookingIntegrationTest {

    @Autowired
    private FacilityBookingService facilityBookingService;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Company testCompany;
    private Room testRoom;
    private User testUser;

    @BeforeEach
    public void setUp() {
        testCompany = companyRepository.findByCompanyCode("RECURRING_TEST_CORP").orElseGet(() -> {
            Company c = new Company();
            c.setName("Recurring Test Corp");
            c.setCompanyCode("RECURRING_TEST_CORP");
            c.setContactInformation("admin@recurring-test.com");
            c.setStatus("ACTIVE");
            return companyRepository.save(c);
        });

        testRoom = roomRepository.findAll().stream()
                .filter(r -> r.getCompany().getId().equals(testCompany.getId()) && "Apollo Conference Room".equals(r.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Room r = new Room();
                    r.setCompany(testCompany);
                    r.setName("Apollo Conference Room");
                    r.setFloor("Floor 3");
                    r.setLocation("East Wing");
                    r.setCapacity(12);
                    r.setStatus("ACTIVE");
                    return roomRepository.save(r);
                });

        testUser = userRepository.findByEmail("lead_organizer@recurring-test.com").orElseGet(() -> {
            User u = new User();
            u.setCompany(testCompany);
            u.setEmail("lead_organizer@recurring-test.com");
            u.setFullName("Lead Organizer");
            u.setPasswordHash("hashedpassword123");
            u.setRole(Role.EMPLOYEE);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });
    }

    @Test
    @DisplayName("Should create daily recurring booking and generate multiple linked occurrences")
    public void testCreateDailyRecurringBooking_GeneratesMultipleOccurrences() {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(9).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(1);
        LocalDate repeatUntil = start.plusDays(4).toLocalDate(); // 5 occurrences total: day 0, 1, 2, 3, 4

        BookingRequest req = new BookingRequest();
        req.setRoomId(testRoom.getId());
        req.setTitle("Daily Team Standup");
        req.setStartTime(start);
        req.setEndTime(end);
        req.setAttendeesCount(5);
        req.setRecurrenceRule("DAILY");
        req.setRecurrenceEndDate(repeatUntil);

        BookingResponse response = facilityBookingService.createBooking(req, testCompany.getId(), testUser.getId());

        assertNotNull(response);
        assertNotNull(response.getRecurrenceId(), "Recurrence ID must be assigned");
        assertEquals("DAILY", response.getRecurrenceRule());
        assertTrue(Boolean.TRUE.equals(response.getIsRecurrenceParent()));

        List<Booking> series = bookingRepository.findByRecurrenceId(response.getRecurrenceId());
        assertEquals(5, series.size(), "Should have created exactly 5 occurrences for 5 consecutive days");

        long parentCount = series.stream().filter(b -> Boolean.TRUE.equals(b.getIsRecurrenceParent())).count();
        assertEquals(1, parentCount, "Exactly one occurrence should be marked as recurrence parent");

        for (int i = 0; i < 5; i++) {
            Booking b = series.get(i);
            assertEquals("CONFIRMED", b.getStatus());
            assertEquals(start.plusDays(i), b.getStartTime());
            assertEquals(end.plusDays(i), b.getEndTime());
            assertEquals(response.getRecurrenceId(), b.getRecurrenceId());
        }
    }

    @Test
    @DisplayName("Should detect conflict if any occurrence in recurring series overlaps with existing booking")
    public void testRecurringBooking_DetectsConflictOnAnyOccurrence() {
        LocalDateTime baseStart = LocalDateTime.now().plusDays(10).withHour(14).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime baseEnd = baseStart.plusHours(1);

        // Pre-book day 2 with a single meeting
        BookingRequest singleConflict = new BookingRequest();
        singleConflict.setRoomId(testRoom.getId());
        singleConflict.setTitle("Conflicting Client Pitch");
        singleConflict.setStartTime(baseStart.plusDays(2).plusMinutes(15));
        singleConflict.setEndTime(baseEnd.plusDays(2).plusMinutes(15));
        singleConflict.setAttendeesCount(4);
        facilityBookingService.createBooking(singleConflict, testCompany.getId(), testUser.getId());

        // Now attempt to book DAILY recurring for 4 days
        BookingRequest recurringReq = new BookingRequest();
        recurringReq.setRoomId(testRoom.getId());
        recurringReq.setTitle("Sprint Planning Daily");
        recurringReq.setStartTime(baseStart);
        recurringReq.setEndTime(baseEnd);
        recurringReq.setAttendeesCount(6);
        recurringReq.setRecurrenceRule("DAILY");
        recurringReq.setRecurrenceEndDate(baseStart.plusDays(3).toLocalDate());

        BookingConflictException ex = assertThrows(BookingConflictException.class, () -> {
            facilityBookingService.createBooking(recurringReq, testCompany.getId(), testUser.getId());
        });

        assertTrue(ex.getMessage().toLowerCase().contains("conflict") || ex.getMessage().toLowerCase().contains("overlaps") || ex.getMessage().toLowerCase().contains("already booked"),
                "Exception message should mention conflict: " + ex.getMessage());
    }

    @Test
    @DisplayName("Should cancel single occurrence without cancelling remaining series")
    public void testCancelSingleOccurrence_DoesNotCancelSeries() {
        LocalDateTime start = LocalDateTime.now().plusDays(20).withHour(11).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(1);
        LocalDate repeatUntil = start.plusWeeks(2).toLocalDate(); // 3 weekly occurrences

        BookingRequest req = new BookingRequest();
        req.setRoomId(testRoom.getId());
        req.setTitle("Weekly Department Sync");
        req.setStartTime(start);
        req.setEndTime(end);
        req.setAttendeesCount(8);
        req.setRecurrenceRule("WEEKLY");
        req.setRecurrenceEndDate(repeatUntil);

        BookingResponse initial = facilityBookingService.createBooking(req, testCompany.getId(), testUser.getId());
        String recurrenceId = initial.getRecurrenceId();

        List<Booking> series = bookingRepository.findByRecurrenceId(recurrenceId);
        assertEquals(3, series.size());

        // Cancel only the second occurrence (cancelSeries = false)
        Booking secondOccurrence = series.get(1);
        facilityBookingService.cancelBooking(secondOccurrence.getId(), testCompany.getId(), testUser.getId(), false, false);

        Booking refreshedSecond = bookingRepository.findById(secondOccurrence.getId()).orElseThrow();
        assertEquals("CANCELLED", refreshedSecond.getStatus());

        Booking first = bookingRepository.findById(series.get(0).getId()).orElseThrow();
        assertEquals("CONFIRMED", first.getStatus());

        Booking third = bookingRepository.findById(series.get(2).getId()).orElseThrow();
        assertEquals("CONFIRMED", third.getStatus());
    }

    @Test
    @DisplayName("Should cancel all future occurrences in series when cancelSeries is true")
    public void testCancelEntireSeries_CancelsAllFutureOccurrences() {
        LocalDateTime start = LocalDateTime.now().plusDays(30).withHour(15).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(1);
        LocalDate repeatUntil = start.plusDays(3).toLocalDate(); // 4 daily occurrences

        BookingRequest req = new BookingRequest();
        req.setRoomId(testRoom.getId());
        req.setTitle("Project Kickoff Workshop");
        req.setStartTime(start);
        req.setEndTime(end);
        req.setAttendeesCount(10);
        req.setRecurrenceRule("DAILY");
        req.setRecurrenceEndDate(repeatUntil);

        BookingResponse initial = facilityBookingService.createBooking(req, testCompany.getId(), testUser.getId());
        String recurrenceId = initial.getRecurrenceId();

        List<Booking> series = bookingRepository.findByRecurrenceId(recurrenceId);
        assertEquals(4, series.size());

        // Cancel with cancelSeries = true on initial booking
        facilityBookingService.cancelBooking(initial.getId(), testCompany.getId(), testUser.getId(), false, true);

        List<Booking> updatedSeries = bookingRepository.findByRecurrenceId(recurrenceId);
        for (Booking b : updatedSeries) {
            assertEquals("CANCELLED", b.getStatus(), "All occurrences in series should be CANCELLED");
        }
    }
}
