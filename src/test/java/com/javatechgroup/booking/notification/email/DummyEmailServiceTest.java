package com.javatechgroup.booking.notification.email;

import com.javatechgroup.booking.domain.Booking;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.Room;
import com.javatechgroup.booking.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class DummyEmailServiceTest {

    private DummyEmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new DummyEmailService(true, "notifications@roombook.internal", 0, 50);
        emailService.clearSentEmails();
    }

    @Test
    @DisplayName("Should simulate sending a plain text email and record in history")
    void testSendPlainEmail() {
        emailService.sendEmail("alex@example.com", "Test Subject", "Test Body Content");

        assertEquals(1, emailService.getSentEmailCount());
        Optional<EmailMessage> latest = emailService.getLatestEmail();
        assertTrue(latest.isPresent());
        assertEquals("alex@example.com", latest.get().getRecipient());
        assertEquals("Test Subject", latest.get().getSubject());
        assertEquals("Test Body Content", latest.get().getBody());
        assertTrue(latest.get().isSimulated());
        assertNotNull(latest.get().getId());
        assertNotNull(latest.get().getSentAt());
    }

    @Test
    @DisplayName("Should simulate booking confirmation email with detailed information")
    void testSendBookingConfirmation() {
        Company company = new Company();
        company.setId(1L);
        company.setName("Acme Innovations");

        Room room = new Room();
        room.setId(10L);
        room.setName("Boardroom Alpha");
        room.setFloor("Floor 3");
        room.setLocation("East Wing");

        User booker = new User();
        booker.setId(100L);
        booker.setFullName("Jane Doe");
        booker.setEmail("jane.doe@acme.com");

        Booking booking = new Booking();
        booking.setId(42L);
        booking.setCompany(company);
        booking.setRoom(room);
        booking.setBooker(booker);
        booking.setTitle("Quarterly Strategy Planning");
        booking.setDescription("Focus on Q4 milestones and budgeting");
        booking.setStartTime(LocalDateTime.of(2026, 10, 15, 10, 0));
        booking.setEndTime(LocalDateTime.of(2026, 10, 15, 11, 30));
        booking.setDepartment("Finance");
        booking.setAttendeesCount(8);

        emailService.sendBookingConfirmation(booking);

        assertEquals(1, emailService.getSentEmailCount());
        EmailMessage sent = emailService.getLatestEmail().orElseThrow();
        assertEquals("jane.doe@acme.com", sent.getRecipient());
        assertEquals("Jane Doe", sent.getRecipientName());
        assertTrue(sent.getSubject().contains("Booking Confirmed: Quarterly Strategy Planning (#42)"));
        assertTrue(sent.getBody().contains("Boardroom Alpha"));
        assertTrue(sent.getBody().contains("Floor 3"));
        assertTrue(sent.getBody().contains("East Wing"));
        assertTrue(sent.getBody().contains("Finance"));
        assertTrue(sent.getBody().contains("Acme Innovations"));
        assertEquals("BOOKING_CONFIRMATION", sent.getType());
    }

    @Test
    @DisplayName("Should simulate booking update email")
    void testSendBookingUpdate() {
        Room room = new Room();
        room.setName("Collab Space 1");
        room.setFloor("Floor 1");

        User booker = new User();
        booker.setFullName("John Smith");
        booker.setEmail("john.smith@acme.com");

        Booking booking = new Booking();
        booking.setId(88L);
        booking.setRoom(room);
        booking.setBooker(booker);
        booking.setTitle("Design Sprint");
        booking.setStartTime(LocalDateTime.of(2026, 10, 20, 14, 0));
        booking.setEndTime(LocalDateTime.of(2026, 10, 20, 15, 0));

        emailService.sendBookingUpdate(booking);

        assertEquals(1, emailService.getSentEmailCount());
        EmailMessage sent = emailService.getLatestEmail().orElseThrow();
        assertEquals("john.smith@acme.com", sent.getRecipient());
        assertTrue(sent.getSubject().contains("Booking Updated: Design Sprint (#88)"));
        assertTrue(sent.getBody().contains("Collab Space 1"));
        assertEquals("BOOKING_UPDATE", sent.getType());
    }

    @Test
    @DisplayName("Should simulate booking cancellation email")
    void testSendBookingCancellation() {
        Room room = new Room();
        room.setName("Briefing Room B");

        User booker = new User();
        booker.setFullName("Sarah Connor");
        booker.setEmail("sarah@resistance.com");

        Booking booking = new Booking();
        booking.setId(99L);
        booking.setRoom(room);
        booking.setBooker(booker);
        booking.setTitle("Security Assessment");
        booking.setStartTime(LocalDateTime.of(2026, 11, 1, 9, 0));
        booking.setEndTime(LocalDateTime.of(2026, 11, 1, 10, 0));

        emailService.sendBookingCancellation(booking);

        assertEquals(1, emailService.getSentEmailCount());
        EmailMessage sent = emailService.getLatestEmail().orElseThrow();
        assertEquals("sarah@resistance.com", sent.getRecipient());
        assertTrue(sent.getSubject().contains("Booking Cancelled: Security Assessment (#99)"));
        assertTrue(sent.getBody().contains("CANCELLED"));
        assertEquals("BOOKING_CANCELLATION", sent.getType());
    }

    @Test
    @DisplayName("Should simulate welcome email for new account")
    void testSendWelcomeEmail() {
        Company company = new Company();
        company.setName("Tech Corp");

        User user = new User();
        user.setCompany(company);
        user.setFullName("Alice Wonder");
        user.setEmail("alice@techcorp.com");
        user.setRole(Role.EMPLOYEE);

        emailService.sendWelcomeEmail(user, "tempPass123!");

        assertEquals(1, emailService.getSentEmailCount());
        EmailMessage sent = emailService.getLatestEmail().orElseThrow();
        assertEquals("alice@techcorp.com", sent.getRecipient());
        assertTrue(sent.getSubject().contains("Welcome to Tech Corp"));
        assertTrue(sent.getBody().contains("tempPass123!"));
        assertEquals("ACCOUNT_WELCOME", sent.getType());
    }

    @Test
    @DisplayName("Should filter sent emails by recipient")
    void testFilterByRecipient() {
        emailService.sendEmail("alice@test.com", "Subject 1", "Body 1");
        emailService.sendEmail("bob@test.com", "Subject 2", "Body 2");
        emailService.sendEmail("alice@test.com", "Subject 3", "Body 3");

        List<EmailMessage> aliceEmails = emailService.getSentEmailsForRecipient("alice@test.com");
        assertEquals(2, aliceEmails.size());

        List<EmailMessage> bobEmails = emailService.getSentEmailsForRecipient("bob@test.com");
        assertEquals(1, bobEmails.size());

        List<EmailMessage> charlieEmails = emailService.getSentEmailsForRecipient("charlie@test.com");
        assertTrue(charlieEmails.isEmpty());
    }

    @Test
    @DisplayName("Should respect max history size in memory")
    void testMaxHistoryBuffer() {
        DummyEmailService smallBufferService = new DummyEmailService(true, "test@test.com", 0, 3);
        smallBufferService.sendEmail("user1@test.com", "S1", "B1");
        smallBufferService.sendEmail("user2@test.com", "S2", "B2");
        smallBufferService.sendEmail("user3@test.com", "S3", "B3");
        smallBufferService.sendEmail("user4@test.com", "S4", "B4");

        assertEquals(3, smallBufferService.getSentEmailCount());
        assertEquals("user4@test.com", smallBufferService.getLatestEmail().orElseThrow().getRecipient());
    }

    @Test
    @DisplayName("Should skip dispatch when service is disabled")
    void testDisabledService() {
        DummyEmailService disabledService = new DummyEmailService(false, "test@test.com", 0, 10);
        disabledService.sendEmail("user@test.com", "Hello", "World");

        assertEquals(0, disabledService.getSentEmailCount());
    }

    @Test
    @DisplayName("Should dispatch simulated emails to both booker and all participants")
    void testSendBookingConfirmationWithParticipants() {
        User booker = new User();
        booker.setFullName("David Host");
        booker.setEmail("david.host@corp.com");

        Booking booking = new Booking();
        booking.setId(101L);
        booking.setTitle("Design Sprint");
        booking.setBooker(booker);
        booking.setStartTime(LocalDateTime.of(2026, 10, 1, 10, 0));
        booking.setEndTime(LocalDateTime.of(2026, 10, 1, 11, 0));

        com.javatechgroup.booking.domain.BookingParticipant p1 = new com.javatechgroup.booking.domain.BookingParticipant(
                booking, null, "coworker@corp.com", "Coworker One", false
        );
        com.javatechgroup.booking.domain.BookingParticipant p2 = new com.javatechgroup.booking.domain.BookingParticipant(
                booking, null, "guest@external.com", "External Guest", true
        );
        booking.addParticipant(p1);
        booking.addParticipant(p2);

        emailService.sendBookingConfirmation(booking);

        // 1 email to booker + 2 to participants = 3 total emails
        assertEquals(3, emailService.getSentEmailCount());
        assertFalse(emailService.getSentEmailsForRecipient("david.host@corp.com").isEmpty());
        assertFalse(emailService.getSentEmailsForRecipient("coworker@corp.com").isEmpty());
        assertFalse(emailService.getSentEmailsForRecipient("guest@external.com").isEmpty());

        EmailMessage guestMsg = emailService.getSentEmailsForRecipient("guest@external.com").get(0);
        assertTrue(guestMsg.getSubject().contains("External Invite"));
        assertEquals("PARTICIPANT_INVITATION", guestMsg.getType());
    }
}
