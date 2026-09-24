package com.magicbricks.booking.notification.email;

import com.magicbricks.booking.domain.Booking;
import com.magicbricks.booking.domain.BookingParticipant;
import com.magicbricks.booking.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.stream.Collectors;

/**
 * Dummy implementation of EmailService that simulates sending emails.
 * <p>
 * Logs formatted email envelopes to the application console, captures sent
 * messages in an in-memory history buffer for inspection/testing, simulates
 * real-world email dispatch latency if configured, and dispatches simulated
 * notifications to both the booker and all meeting participants (internal and external).
 */
@Service
@Primary
public class DummyEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(DummyEmailService.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Value("${app.email.enabled:true}")
    private boolean enabled = true;

    @Value("${app.email.from:notifications@roombook.internal}")
    private String defaultSender = "notifications@roombook.internal";

    @Value("${app.email.dummy.simulate-delay-ms:0}")
    private long simulateDelayMs = 0;

    @Value("${app.email.dummy.max-history:200}")
    private int maxHistorySize = 200;

    private final Deque<EmailMessage> sentEmails = new ConcurrentLinkedDeque<>();

    public DummyEmailService() {
    }

    public DummyEmailService(boolean enabled, String defaultSender, long simulateDelayMs, int maxHistorySize) {
        this.enabled = enabled;
        this.defaultSender = defaultSender;
        this.simulateDelayMs = simulateDelayMs;
        this.maxHistorySize = maxHistorySize;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        EmailMessage msg = new EmailMessage();
        msg.setId(generateMessageId());
        msg.setRecipient(to);
        msg.setSender(defaultSender);
        msg.setSubject(subject);
        msg.setBody(body);
        msg.setType("GENERIC");
        msg.setSentAt(LocalDateTime.now());
        msg.setSimulated(true);

        sendEmail(msg);
    }

    @Override
    public void sendEmail(EmailMessage message) {
        if (!enabled) {
            log.info("[DUMMY EMAIL SERVICE] Email dispatch skipped (app.email.enabled=false). Subject: '{}'", message.getSubject());
            return;
        }

        if (message.getId() == null || message.getId().isBlank()) {
            message.setId(generateMessageId());
        }
        if (message.getSender() == null || message.getSender().isBlank()) {
            message.setSender(defaultSender);
        }
        if (message.getSentAt() == null) {
            message.setSentAt(LocalDateTime.now());
        }
        message.setSimulated(true);

        // Simulate network latency if configured
        if (simulateDelayMs > 0) {
            try {
                Thread.sleep(simulateDelayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("[DUMMY EMAIL SERVICE] Simulated delay was interrupted", e);
            }
        }

        // Print visually distinct simulated email box to logs
        logSimulatedEmail(message);

        // Keep in memory history
        sentEmails.addFirst(message);
        while (sentEmails.size() > maxHistorySize) {
            sentEmails.pollLast();
        }
    }

    @Override
    public void sendBookingConfirmation(Booking booking) {
        if (booking == null || booking.getBooker() == null) {
            log.warn("[DUMMY EMAIL SERVICE] Cannot send booking confirmation: booking or booker is null");
            return;
        }

        User booker = booking.getBooker();
        String roomName = booking.getRoom() != null ? booking.getRoom().getName() : "Room";
        String floor = (booking.getRoom() != null && booking.getRoom().getFloor() != null) ? booking.getRoom().getFloor() : "N/A";
        String location = (booking.getRoom() != null && booking.getRoom().getLocation() != null) ? booking.getRoom().getLocation() : "N/A";
        String companyName = booking.getCompany() != null ? booking.getCompany().getName() : "Corporate Room Booking";

        String subject = String.format("[RoomBook] Booking Confirmed: %s (#%d)", booking.getTitle(), booking.getId());

        StringBuilder body = new StringBuilder();
        body.append(String.format("Dear %s,%n%n", booker.getFullName()));
        body.append(String.format("Your room booking has been successfully confirmed at %s.%n%n", companyName));
        body.append("Booking Details:\n");
        body.append(String.format("  • Booking Reference: #%d%n", booking.getId()));
        body.append(String.format("  • Meeting Title:     %s%n", booking.getTitle()));
        body.append(String.format("  • Room:              %s (Floor: %s, Location: %s)%n", roomName, floor, location));
        body.append(String.format("  • Start Time:        %s%n", formatDateTime(booking.getStartTime())));
        body.append(String.format("  • End Time:          %s%n", formatDateTime(booking.getEndTime())));
        body.append(String.format("  • Department:        %s%n", booking.getDepartment() != null ? booking.getDepartment() : "General"));
        body.append(String.format("  • Expected Attendees:%d%n", booking.getAttendeesCount() != null ? booking.getAttendeesCount() : 1));
        if (booking.getDescription() != null && !booking.getDescription().isBlank()) {
            body.append(String.format("  • Notes:             %s%n", booking.getDescription()));
        }
        if (booking.getParticipants() != null && !booking.getParticipants().isEmpty()) {
            body.append("\nInvited Participants:\n");
            for (BookingParticipant p : booking.getParticipants()) {
                body.append(String.format("    - %s (%s)%s%n",
                        p.getName() != null ? p.getName() : p.getEmail(),
                        p.getEmail(),
                        Boolean.TRUE.equals(p.getIsExternal()) ? " [External]" : ""));
            }
        }
        body.append(String.format("%nIf you need to modify or cancel this reservation, please manage it via the Corporate Room Booking portal.%n%n"));
        body.append("Warm regards,\nCorporate Room Booking System");

        EmailMessage message = new EmailMessage(
                generateMessageId(),
                booker.getEmail(),
                booker.getFullName(),
                defaultSender,
                subject,
                body.toString(),
                "BOOKING_CONFIRMATION",
                LocalDateTime.now(),
                true
        );

        sendEmail(message);

        // Also notify all invited participants
        sendParticipantInvitations(booking, "CREATE");
    }

    @Override
    public void sendBookingUpdate(Booking booking) {
        if (booking == null || booking.getBooker() == null) {
            log.warn("[DUMMY EMAIL SERVICE] Cannot send booking update: booking or booker is null");
            return;
        }

        User booker = booking.getBooker();
        String roomName = booking.getRoom() != null ? booking.getRoom().getName() : "Room";
        String floor = (booking.getRoom() != null && booking.getRoom().getFloor() != null) ? booking.getRoom().getFloor() : "N/A";
        String location = (booking.getRoom() != null && booking.getRoom().getLocation() != null) ? booking.getRoom().getLocation() : "N/A";

        String subject = String.format("[RoomBook] Booking Updated: %s (#%d)", booking.getTitle(), booking.getId());

        StringBuilder body = new StringBuilder();
        body.append(String.format("Dear %s,%n%n", booker.getFullName()));
        body.append(String.format("Your room booking #%d has been updated.%n%n", booking.getId()));
        body.append("Updated Booking Details:\n");
        body.append(String.format("  • Booking Reference: #%d%n", booking.getId()));
        body.append(String.format("  • Meeting Title:     %s%n", booking.getTitle()));
        body.append(String.format("  • Room:              %s (Floor: %s, Location: %s)%n", roomName, floor, location));
        body.append(String.format("  • Start Time:        %s%n", formatDateTime(booking.getStartTime())));
        body.append(String.format("  • End Time:          %s%n", formatDateTime(booking.getEndTime())));
        body.append(String.format("  • Department:        %s%n", booking.getDepartment() != null ? booking.getDepartment() : "General"));
        body.append(String.format("  • Expected Attendees:%d%n", booking.getAttendeesCount() != null ? booking.getAttendeesCount() : 1));
        if (booking.getParticipants() != null && !booking.getParticipants().isEmpty()) {
            body.append("\nInvited Participants:\n");
            for (BookingParticipant p : booking.getParticipants()) {
                body.append(String.format("    - %s (%s)%s%n",
                        p.getName() != null ? p.getName() : p.getEmail(),
                        p.getEmail(),
                        Boolean.TRUE.equals(p.getIsExternal()) ? " [External]" : ""));
            }
        }
        body.append(String.format("%nWarm regards,%nCorporate Room Booking System"));

        EmailMessage message = new EmailMessage(
                generateMessageId(),
                booker.getEmail(),
                booker.getFullName(),
                defaultSender,
                subject,
                body.toString(),
                "BOOKING_UPDATE",
                LocalDateTime.now(),
                true
        );

        sendEmail(message);

        // Also notify all invited participants
        sendParticipantInvitations(booking, "UPDATE");
    }

    @Override
    public void sendBookingCancellation(Booking booking) {
        if (booking == null || booking.getBooker() == null) {
            log.warn("[DUMMY EMAIL SERVICE] Cannot send booking cancellation: booking or booker is null");
            return;
        }

        User booker = booking.getBooker();
        String roomName = booking.getRoom() != null ? booking.getRoom().getName() : "Room";

        String subject = String.format("[RoomBook] Booking Cancelled: %s (#%d)", booking.getTitle(), booking.getId());

        StringBuilder body = new StringBuilder();
        body.append(String.format("Dear %s,%n%n", booker.getFullName()));
        body.append(String.format("Your room booking #%d ('%s') has been cancelled.%n%n", booking.getId(), booking.getTitle()));
        body.append("Cancelled Slot Information:\n");
        body.append(String.format("  • Room:              %s%n", roomName));
        body.append(String.format("  • Scheduled Slot:    %s to %s%n", formatDateTime(booking.getStartTime()), formatDateTime(booking.getEndTime())));
        body.append(String.format("  • Status:            CANCELLED%n%n"));
        body.append("If this cancellation was unintended, please visit the portal to create a new reservation.\n\n");
        body.append("Warm regards,\nCorporate Room Booking System");

        EmailMessage message = new EmailMessage(
                generateMessageId(),
                booker.getEmail(),
                booker.getFullName(),
                defaultSender,
                subject,
                body.toString(),
                "BOOKING_CANCELLATION",
                LocalDateTime.now(),
                true
        );

        sendEmail(message);

        // Also notify all invited participants
        sendParticipantInvitations(booking, "CANCEL");
    }

    private void sendParticipantInvitations(Booking booking, String updateType) {
        if (booking == null || booking.getParticipants() == null || booking.getParticipants().isEmpty()) {
            return;
        }

        User booker = booking.getBooker();
        String bookerName = booker != null ? booker.getFullName() : "Organizer";
        String bookerEmail = booker != null ? booker.getEmail() : "";
        String roomName = booking.getRoom() != null ? booking.getRoom().getName() : "Room";
        String floor = (booking.getRoom() != null && booking.getRoom().getFloor() != null) ? booking.getRoom().getFloor() : "N/A";
        String location = (booking.getRoom() != null && booking.getRoom().getLocation() != null) ? booking.getRoom().getLocation() : "N/A";
        String companyName = booking.getCompany() != null ? booking.getCompany().getName() : "Corporate Room Booking";

        for (BookingParticipant participant : booking.getParticipants()) {
            if (participant.getEmail() == null || participant.getEmail().isBlank()) {
                continue;
            }
            // Skip sending to booker if booker is listed as participant to avoid duplicate emails
            if (bookerEmail != null && bookerEmail.equalsIgnoreCase(participant.getEmail())) {
                continue;
            }

            boolean isExt = Boolean.TRUE.equals(participant.getIsExternal());
            String displayName = participant.getName() != null && !participant.getName().isBlank()
                    ? participant.getName()
                    : (isExt ? "Guest" : participant.getEmail());

            String subject;
            StringBuilder body = new StringBuilder();

            if ("UPDATE".equals(updateType)) {
                subject = String.format("[RoomBook%s] Meeting Updated: %s (#%d)",
                        isExt ? " External" : "", booking.getTitle(), booking.getId());
                body.append(String.format("Dear %s,%n%n", displayName));
                body.append(String.format("The scheduled meeting '%s' organized by %s (%s) has been updated.%n%n",
                        booking.getTitle(), bookerName, bookerEmail));
                body.append("Updated Meeting Details:\n");
                body.append(String.format("  • Meeting Title:     %s%n", booking.getTitle()));
                body.append(String.format("  • Room:              %s (Floor: %s, Location: %s)%n", roomName, floor, location));
                body.append(String.format("  • Time Slot:         %s to %s%n", formatDateTime(booking.getStartTime()), formatDateTime(booking.getEndTime())));
                body.append(String.format("  • Organization:      %s%n", companyName));
                body.append(String.format("  • Booking Reference: #%d%n", booking.getId()));
                body.append(String.format("%nWarm regards,%nCorporate Room Booking System"));
            } else if ("CANCEL".equals(updateType)) {
                subject = String.format("[RoomBook%s] Meeting Cancelled: %s (#%d)",
                        isExt ? " External" : "", booking.getTitle(), booking.getId());
                body.append(String.format("Dear %s,%n%n", displayName));
                body.append(String.format("The meeting '%s' scheduled for %s in %s has been cancelled by organizer %s.%n%n",
                        booking.getTitle(), formatDateTime(booking.getStartTime()), roomName, bookerName));
                body.append("Warm regards,\nCorporate Room Booking System");
            } else {
                // INVITE / CREATE
                subject = String.format("[RoomBook%s] Meeting Invitation: %s (#%d)",
                        isExt ? " External Invite" : "", booking.getTitle(), booking.getId());
                body.append(String.format("Dear %s,%n%n", displayName));
                body.append(String.format("You have been invited by %s (%s) to attend a meeting at %s.%n%n",
                        bookerName, bookerEmail, companyName));
                body.append("Meeting Invitation Details:\n");
                body.append(String.format("  • Meeting Title:     %s%n", booking.getTitle()));
                body.append(String.format("  • Host / Organizer:  %s (%s)%n", bookerName, bookerEmail));
                body.append(String.format("  • Room:              %s (Floor: %s, Location: %s)%n", roomName, floor, location));
                body.append(String.format("  • Time Slot:         %s to %s%n", formatDateTime(booking.getStartTime()), formatDateTime(booking.getEndTime())));
                body.append(String.format("  • Booking Reference: #%d%n", booking.getId()));
                if (booking.getDescription() != null && !booking.getDescription().isBlank()) {
                    body.append(String.format("  • Agenda / Notes:    %s%n", booking.getDescription()));
                }
                if (isExt) {
                    body.append(String.format("%nNote: You are registered as an external participant for this meeting.%n"));
                }
                body.append(String.format("%nWarm regards,%nCorporate Room Booking System"));
            }

            EmailMessage msg = new EmailMessage(
                    generateMessageId(),
                    participant.getEmail(),
                    displayName,
                    defaultSender,
                    subject,
                    body.toString(),
                    "UPDATE".equals(updateType) ? "PARTICIPANT_UPDATE" : ("CANCEL".equals(updateType) ? "PARTICIPANT_CANCELLATION" : "PARTICIPANT_INVITATION"),
                    LocalDateTime.now(),
                    true
            );
            sendEmail(msg);
        }
    }

    @Override
    public void sendWelcomeEmail(User user, String temporaryPassword) {
        if (user == null || user.getEmail() == null) {
            log.warn("[DUMMY EMAIL SERVICE] Cannot send welcome email: user or email is null");
            return;
        }

        String companyName = user.getCompany() != null ? user.getCompany().getName() : "Corporate Room Booking";
        String subject = String.format("[RoomBook] Welcome to %s", companyName);

        StringBuilder body = new StringBuilder();
        body.append(String.format("Dear %s,%n%n", user.getFullName()));
        body.append(String.format("Welcome to the %s Room Booking Portal!%n%n", companyName));
        body.append("Your account has been provisioned with the following details:\n");
        body.append(String.format("  • Login Email:       %s%n", user.getEmail()));
        body.append(String.format("  • Role:              %s%n", user.getRole()));
        if (temporaryPassword != null && !temporaryPassword.isBlank()) {
            body.append(String.format("  • Temporary Password:%s%n", temporaryPassword));
            body.append(String.format("%nPlease make sure to change your password after your initial login.%n"));
        }
        body.append(String.format("%nWarm regards,%nCorporate Room Booking Administration"));

        EmailMessage message = new EmailMessage(
                generateMessageId(),
                user.getEmail(),
                user.getFullName(),
                defaultSender,
                subject,
                body.toString(),
                "ACCOUNT_WELCOME",
                LocalDateTime.now(),
                true
        );

        sendEmail(message);
    }

    @Override
    public List<EmailMessage> getSentEmails() {
        return Collections.unmodifiableList(new ArrayList<>(sentEmails));
    }

    @Override
    public Optional<EmailMessage> getLatestEmail() {
        return Optional.ofNullable(sentEmails.peekFirst());
    }

    @Override
    public List<EmailMessage> getSentEmailsForRecipient(String email) {
        if (email == null) return List.of();
        return sentEmails.stream()
                .filter(m -> email.equalsIgnoreCase(m.getRecipient()))
                .collect(Collectors.toList());
    }

    @Override
    public void clearSentEmails() {
        sentEmails.clear();
        log.debug("[DUMMY EMAIL SERVICE] Sent emails buffer cleared");
    }

    @Override
    public int getSentEmailCount() {
        return sentEmails.size();
    }

    private String generateMessageId() {
        return "SIM-MSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String formatDateTime(LocalDateTime dt) {
        return dt != null ? dt.format(TIME_FORMATTER) : "N/A";
    }

    private void logSimulatedEmail(EmailMessage msg) {
        String recipientStr = (msg.getRecipientName() != null && !msg.getRecipientName().isBlank())
                ? String.format("%s <%s>", msg.getRecipientName(), msg.getRecipient())
                : msg.getRecipient();

        String banner = "\n" +
                "================================================================================\n" +
                "  [DUMMY EMAIL SERVICE] Simulated Outgoing Email Dispatch                       \n" +
                "--------------------------------------------------------------------------------\n" +
                "  Message ID : " + msg.getId() + "\n" +
                "  Type       : " + msg.getType() + "\n" +
                "  From       : " + msg.getSender() + "\n" +
                "  To         : " + recipientStr + "\n" +
                "  Subject    : " + msg.getSubject() + "\n" +
                "  Timestamp  : " + formatDateTime(msg.getSentAt()) + "\n" +
                "--------------------------------------------------------------------------------\n" +
                "  Body:\n" +
                indent(msg.getBody(), "    ") + "\n" +
                "================================================================================";

        log.info(banner);
    }

    private String indent(String text, String prefix) {
        if (text == null) return "";
        return Arrays.stream(text.split("\\R"))
                .map(line -> prefix + line)
                .collect(Collectors.joining("\n"));
    }
}
