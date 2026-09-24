package com.javatechgroup.booking.notification.event;

import com.javatechgroup.booking.domain.Booking;

/**
 * Event fired when an existing booking is updated.
 */
public class BookingUpdatedEvent {

    private final Booking booking;

    public BookingUpdatedEvent(Booking booking) {
        this.booking = booking;
    }

    public Booking getBooking() {
        return booking;
    }
}
