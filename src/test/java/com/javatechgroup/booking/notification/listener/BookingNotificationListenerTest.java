package com.javatechgroup.booking.notification.listener;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.javatechgroup.booking.domain.Booking;
import com.javatechgroup.booking.notification.email.EmailService;
import com.javatechgroup.booking.notification.event.BookingCancelledEvent;
import com.javatechgroup.booking.notification.event.BookingCreatedEvent;
import com.javatechgroup.booking.notification.event.BookingUpdatedEvent;

class BookingNotificationListenerTest {

    private EmailService emailService;
    private BookingNotificationListener listener;

    @BeforeEach
    void setUp() {
        emailService = Mockito.mock(EmailService.class);
        listener = new BookingNotificationListener(emailService);
    }

    @Test
    @DisplayName("Should invoke sendBookingConfirmation when BookingCreatedEvent is handled")
    void testHandleBookingCreated() {
        Booking booking = new Booking();
        booking.setId(10L);
        BookingCreatedEvent event = new BookingCreatedEvent(booking);

        listener.onBookingCreated(event);

        verify(emailService, times(1)).sendBookingConfirmation(booking);
    }

    @Test
    @DisplayName("Should invoke sendBookingUpdate when BookingUpdatedEvent is handled")
    void testHandleBookingUpdated() {
        Booking booking = new Booking();
        booking.setId(11L);
        BookingUpdatedEvent event = new BookingUpdatedEvent(booking);

        listener.onBookingUpdated(event);

        verify(emailService, times(1)).sendBookingUpdate(booking);
    }

    @Test
    @DisplayName("Should invoke sendBookingCancellation when BookingCancelledEvent is handled")
    void testHandleBookingCancelled() {
        Booking booking = new Booking();
        booking.setId(12L);
        BookingCancelledEvent event = new BookingCancelledEvent(booking);

        listener.onBookingCancelled(event);

        verify(emailService, times(1)).sendBookingCancellation(booking);
    }

    @Test
    @DisplayName("Should silently handle exceptions without throwing and re-propagating")
    void testExceptionHandlingDoesNotPropagate() {
        Booking booking = new Booking();
        doThrow(new RuntimeException("Simulated email service error")).when(emailService).sendBookingConfirmation(booking);

        // Must not throw exception
        assertDoesNotThrow(() -> listener.onBookingCreated(new BookingCreatedEvent(booking)));
    }

    private void assertDoesNotThrow(Runnable action) {
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(action::run);
    }
}
