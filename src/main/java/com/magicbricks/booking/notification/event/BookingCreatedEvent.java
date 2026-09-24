package com.magicbricks.booking.notification.event;

import com.magicbricks.booking.domain.Booking;

/**
 * Event fired when a new booking is created.
 */
public class BookingCreatedEvent {

    private final Booking booking;

    public BookingCreatedEvent(Booking booking) {
        this.booking = booking;
    }

    public Booking getBooking() {
        return booking;
    }
}
