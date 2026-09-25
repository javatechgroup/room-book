package com.javatechgroup.booking.notification.event;

import com.javatechgroup.booking.domain.Booking;

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
