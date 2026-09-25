package com.javatechgroup.booking.notification.email;

import com.javatechgroup.booking.domain.Booking;
import com.javatechgroup.booking.domain.User;

import java.util.List;
import java.util.Optional;

/**
 * Service contract for email dispatch across the booking application.
 */
public interface EmailService {

    /**
     * Send a plain text email to a recipient.
     *
     * @param to recipient email address
     * @param subject email subject
     * @param body email body content
     */
    void sendEmail(String to, String subject, String body);

    /**
     * Send a structured email message.
     *
     * @param message the email message containing metadata and content
     */
    void sendEmail(EmailMessage message);

    /**
     * Dispatches a booking confirmation notification to the booker.
     *
     * @param booking the confirmed booking
     */
    void sendBookingConfirmation(Booking booking);

    /**
     * Dispatches a booking update notification to the booker.
     *
     * @param booking the updated booking
     */
    void sendBookingUpdate(Booking booking);

    /**
     * Dispatches a booking cancellation notification to the booker.
     *
     * @param booking the cancelled booking
     */
    void sendBookingCancellation(Booking booking);

    /**
     * Dispatches a welcome email with credentials to a newly onboarded user.
     *
     * @param user the newly created user
     * @param temporaryPassword temporary password (if applicable)
     */
    void sendWelcomeEmail(User user, String temporaryPassword);

    /**
     * Returns an unmodifiable view of sent/simulated emails in chronological order (most recent first).
     */
    List<EmailMessage> getSentEmails();

    /**
     * Returns the most recently sent email message, if any.
     */
    Optional<EmailMessage> getLatestEmail();

    /**
     * Returns all sent messages matching a specific recipient email.
     */
    List<EmailMessage> getSentEmailsForRecipient(String email);

    /**
     * Clears sent email history (useful for testing and reset).
     */
    void clearSentEmails();

    /**
     * Returns count of all sent emails in memory.
     */
    int getSentEmailCount();
}
