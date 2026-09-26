package com.javatechgroup.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.javatechgroup.booking.domain.BookingParticipant;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.Room;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.dto.BookingRequest;
import com.javatechgroup.booking.dto.BookingResponse;
import com.javatechgroup.booking.dto.ParticipantDto;
import com.javatechgroup.booking.notification.email.DummyEmailService;
import com.javatechgroup.booking.notification.email.EmailMessage;
import com.javatechgroup.booking.repository.BookingParticipantRepository;
import com.javatechgroup.booking.repository.BookingRepository;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.RoomRepository;
import com.javatechgroup.booking.repository.UserRepository;
import com.javatechgroup.booking.service.FacilityBookingService;

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

    @Autowired
    private BookingParticipantRepository participantRepository;

    private Company company;
    private Room room;
    private User employee;
    private User colleague;

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

        colleague = userRepository.findByEmail("colleague.internal@corp.com").orElseGet(() -> {
            User u = new User();
            u.setCompany(company);
            u.setEmail("colleague.internal@corp.com");
            u.setFullName("Alice Colleague");
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

        // Verify Dummy Email was captured for booker
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

    @Test
    @DisplayName("End-to-End: Adding internal & external participants saves to DB, warns outside company, and sends dummy emails to all")
    public void testParticipantsLifecycleAndEmails() {
        LocalDateTime start = LocalDateTime.now().plusDays(3).withHour(14).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(1);

        BookingRequest request = new BookingRequest();
        request.setRoomId(room.getId());
        request.setTitle("Cross-Company Product Demo");
        request.setDescription("Reviewing product integration with partner");
        request.setStartTime(start);
        request.setEndTime(end);
        request.setAttendeesCount(3);

        // Add 1 internal company employee and 1 external participant
        List<ParticipantDto> participants = new ArrayList<>();
        participants.add(new ParticipantDto("colleague.internal@corp.com", "Alice Colleague", false));
        participants.add(new ParticipantDto("partner@externalclient.org", "Bob External", true));
        request.setParticipants(participants);

        // 1. CREATE BOOKING WITH PARTICIPANTS
        BookingResponse created = facilityBookingService.createBooking(request, company.getId(), employee.getId());
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(2, created.getParticipants().size());

        // Check internal vs external categorization
        ParticipantDto internalP = created.getParticipants().stream()
                .filter(p -> "colleague.internal@corp.com".equalsIgnoreCase(p.getEmail()))
                .findFirst().orElseThrow();
        assertFalse(internalP.getIsExternal());
        assertNotNull(internalP.getUserId());

        ParticipantDto externalP = created.getParticipants().stream()
                .filter(p -> "partner@externalclient.org".equalsIgnoreCase(p.getEmail()))
                .findFirst().orElseThrow();
        assertTrue(externalP.getIsExternal());
        assertNull(externalP.getUserId());

        // 2. VERIFY PARTICIPANTS PERSISTED IN DB
        List<BookingParticipant> dbParticipants = participantRepository.findByBookingId(created.getId());
        assertEquals(2, dbParticipants.size());

        // 3. VERIFY DUMMY EMAILS SENT TO BOOKER + ALL PARTICIPANTS
        // 1 email to booker + 1 to colleague.internal + 1 to partner@externalclient.org = 3 emails
        assertEquals(3, dummyEmailService.getSentEmailCount());
        assertFalse(dummyEmailService.getSentEmailsForRecipient("emp.emailtest@corp.com").isEmpty());
        assertFalse(dummyEmailService.getSentEmailsForRecipient("colleague.internal@corp.com").isEmpty());
        assertFalse(dummyEmailService.getSentEmailsForRecipient("partner@externalclient.org").isEmpty());

        EmailMessage externalEmail = dummyEmailService.getSentEmailsForRecipient("partner@externalclient.org").get(0);
        assertTrue(externalEmail.getBody().contains("external participant"));
        assertEquals("PARTICIPANT_INVITATION", externalEmail.getType());

        // 4. EDIT BOOKING: REMOVE EXTERNAL GUEST, ADD ANOTHER EXTERNAL
        dummyEmailService.clearSentEmails();

        BookingRequest updateReq = new BookingRequest();
        updateReq.setRoomId(room.getId());
        updateReq.setTitle("Cross-Company Product Demo (Rescheduled)");
        updateReq.setStartTime(start.plusHours(1));
        updateReq.setEndTime(end.plusHours(1));

        List<ParticipantDto> updatedParticipants = new ArrayList<>();
        // Keep internal colleague
        updatedParticipants.add(new ParticipantDto("colleague.internal@corp.com", "Alice Colleague", false));
        // Remove Bob External, add Consultant Dan
        updatedParticipants.add(new ParticipantDto("dan@consultingfirm.com", "Dan Consultant", true));
        updateReq.setParticipants(updatedParticipants);

        BookingResponse updated = facilityBookingService.updateBooking(created.getId(), updateReq, company.getId(), employee.getId(), false);
        assertEquals(2, updated.getParticipants().size());

        // Verify DB reflects updated participants
        List<BookingParticipant> updatedDbParticipants = participantRepository.findByBookingId(created.getId());
        assertEquals(2, updatedDbParticipants.size());
        assertTrue(updatedDbParticipants.stream().anyMatch(p -> "dan@consultingfirm.com".equalsIgnoreCase(p.getEmail())));
        assertFalse(updatedDbParticipants.stream().anyMatch(p -> "partner@externalclient.org".equalsIgnoreCase(p.getEmail())));

        // Verify update emails were sent to all participants
        // 1 to booker + 1 to colleague.internal + 1 to dan@consultingfirm.com = 3 emails
        assertEquals(3, dummyEmailService.getSentEmailCount());
        assertFalse(dummyEmailService.getSentEmailsForRecipient("dan@consultingfirm.com").isEmpty());
        assertEquals("PARTICIPANT_UPDATE", dummyEmailService.getSentEmailsForRecipient("dan@consultingfirm.com").get(0).getType());
    }
}
