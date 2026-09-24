package com.magicbricks.booking;

import com.magicbricks.booking.domain.Company;
import com.magicbricks.booking.domain.Role;
import com.magicbricks.booking.domain.Room;
import com.magicbricks.booking.domain.User;
import com.magicbricks.booking.dto.BookingRequest;
import com.magicbricks.booking.dto.BookingResponse;
import com.magicbricks.booking.notification.email.DummyEmailService;
import com.magicbricks.booking.notification.email.EmailMessage;
import com.magicbricks.booking.repository.BookingRepository;
import com.magicbricks.booking.repository.CompanyRepository;
import com.magicbricks.booking.repository.RoomRepository;
import com.magicbricks.booking.repository.UserRepository;
import com.magicbricks.booking.service.FacilityBookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BookingEmailIntegrationTest {

    @Autowired
    private FacilityBookingService facilityBookingService;

    @Autowired
    private DummyEmailService dummyEmailService;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Company company;
    private Room room;
    private User employee;

    @BeforeEach
    public void setUp() {
        dummyEmailService.clearSentEmails();

        company = companyRepository.findByCompanyCode("EMAIL_TEST_CORP").orElseGet(() -> {
            Company c = new Company();
            c.setName("Email Test Corp");
            c.setCompanyCode("EMAIL_TEST_CORP");
            c.setContactInformation("admin@emailtest.com");
            c.setStatus("ACTIVE");
            return companyRepository.save(c);
        });

        employee = userRepository.findByEmail("emp.emailtest@corp.com").orElseGet(() -> {
            User u = new User();
            u.setCompany(company);
            u.setEmail("emp.emailtest@corp.com");
            u.setFullName("John EmailTester");
            u.setPasswordHash("hashedpass");
            u.setRole(Role.EMPLOYEE);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        room = roomRepository.findAll().stream()
                .filter(r -> r.getCompany().getId().equals(company.getId()) && "Boardroom Test".equals(r.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Room r = new Room();
                    r.setCompany(company);
                    r.setName("Boardroom Test");
                    r.setFloor("Floor 2");
                    r.setLocation("West Wing");
                    r.setCapacity(12);
                    r.setStatus("AVAILABLE");
                    return roomRepository.save(r);
                });

        bookingRepository.deleteAll(bookingRepository.findByBookerId(employee.getId()));
    }

    @Test
    @DisplayName("End-to-End: Creating, updating, and cancelling booking triggers dummy email simulation")
    public void testBookingLifecycleEmails() {
        // 1. CREATE BOOKING
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(1);

        BookingRequest createReq = new BookingRequest();
        createReq.setRoomId(room.getId());
        createReq.setTitle("Simulated Email Sprint Review");
        createReq.setDescription("Validating email dispatch simulation");
        createReq.setStartTime(start);
        createReq.setEndTime(end);
        createReq.setAttendeesCount(5);
        createReq.setDepartment("Engineering");

        BookingResponse created = facilityBookingService.createBooking(createReq, company.getId(), employee.getId());
        assertNotNull(created);
        assertNotNull(created.getId());

        // Verify Dummy Email was captured
        assertEquals(1, dummyEmailService.getSentEmailCount());
        Optional<EmailMessage> createdMsg = dummyEmailService.getLatestEmail();
        assertTrue(createdMsg.isPresent());
        assertEquals("emp.emailtest@corp.com", createdMsg.get().getRecipient());
        assertEquals("BOOKING_CONFIRMATION", createdMsg.get().getType());
        assertTrue(createdMsg.get().getSubject().contains("Booking Confirmed: Simulated Email Sprint Review"));
        assertTrue(createdMsg.get().getBody().contains("Boardroom Test"));
        assertTrue(createdMsg.get().getBody().contains("Floor 2"));

        // 2. UPDATE BOOKING
        LocalDateTime newStart = start.plusHours(2);
        LocalDateTime newEnd = end.plusHours(2);
        BookingRequest updateReq = new BookingRequest();
        updateReq.setRoomId(room.getId());
        updateReq.setTitle("Simulated Email Sprint Review (Rescheduled)");
        updateReq.setDescription("Updated description");
        updateReq.setStartTime(newStart);
        updateReq.setEndTime(newEnd);
        updateReq.setAttendeesCount(6);

        BookingResponse updated = facilityBookingService.updateBooking(created.getId(), updateReq, company.getId(), employee.getId(), false);
        assertNotNull(updated);

        // Verify Update Email was captured
        assertEquals(2, dummyEmailService.getSentEmailCount());
        Optional<EmailMessage> updatedMsg = dummyEmailService.getLatestEmail();
        assertTrue(updatedMsg.isPresent());
        assertEquals("emp.emailtest@corp.com", updatedMsg.get().getRecipient());
        assertEquals("BOOKING_UPDATE", updatedMsg.get().getType());
        assertTrue(updatedMsg.get().getSubject().contains("Booking Updated: Simulated Email Sprint Review (Rescheduled)"));

        // 3. CANCEL BOOKING
        BookingResponse cancelled = facilityBookingService.cancelBooking(created.getId(), company.getId(), employee.getId(), false);
        assertEquals("CANCELLED", cancelled.getStatus());

        // Verify Cancellation Email was captured
        assertEquals(3, dummyEmailService.getSentEmailCount());
        Optional<EmailMessage> cancelledMsg = dummyEmailService.getLatestEmail();
        assertTrue(cancelledMsg.isPresent());
        assertEquals("emp.emailtest@corp.com", cancelledMsg.get().getRecipient());
        assertEquals("BOOKING_CANCELLATION", cancelledMsg.get().getType());
        assertTrue(cancelledMsg.get().getSubject().contains("Booking Cancelled"));
    }
}
