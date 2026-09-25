package com.javatechgroup.booking.notification.event;

import com.javatechgroup.booking.domain.Booking;

/**
 * Event fired when a booking is cancelled.
 */
public class BookingCancelledEvent {

    private final Booking booking;

    public BookingCancelledEvent(Booking booking) {
        this.booking = booking;
    }

    public Booking getBooking() {
        return booking;
    }
}
