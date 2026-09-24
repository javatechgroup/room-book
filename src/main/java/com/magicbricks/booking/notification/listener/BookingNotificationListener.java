package com.magicbricks.booking.notification.listener;

import com.magicbricks.booking.notification.email.EmailService;
import com.magicbricks.booking.notification.event.BookingCancelledEvent;
import com.magicbricks.booking.notification.event.BookingCreatedEvent;
import com.magicbricks.booking.notification.event.BookingUpdatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Event listener that reacts to booking lifecycle events and delegates
 * notifications to the configured email service in a decoupled manner.
 */
@Component
public class BookingNotificationListener {

	private static final Logger log = LoggerFactory.getLogger(BookingNotificationListener.class);
	private final EmailService emailService;

	public BookingNotificationListener(EmailService emailService) {
		this.emailService = emailService;
	}

	@EventListener
	public void onBookingCreated(BookingCreatedEvent event) {
		try {
			if (event.getBooking() != null) {
				log.info("Received BookingCreatedEvent for booking ID: {}", event.getBooking().getId());
				emailService.sendBookingConfirmation(event.getBooking());
			}
		} catch (Exception e) {
			log.error("Failed to process booking confirmation notification for booking: {}",
					event.getBooking() != null ? event.getBooking().getId() : "null", e);
		}
	}

	@EventListener
	public void onBookingUpdated(BookingUpdatedEvent event) {
		try {
			if (event.getBooking() != null) {
				log.info("Received BookingUpdatedEvent for booking ID: {}", event.getBooking().getId());
				emailService.sendBookingUpdate(event.getBooking());
			}
		} catch (Exception e) {
			log.error("Failed to process booking update notification for booking: {}",
					event.getBooking() != null ? event.getBooking().getId() : "null", e);
		}
	}

	@EventListener
	public void onBookingCancelled(BookingCancelledEvent event) {
		try {
			if (event.getBooking() != null) {
				log.info("Received BookingCancelledEvent for booking ID: {}", event.getBooking().getId());
				emailService.sendBookingCancellation(event.getBooking());
			}
		} catch (Exception e) {
			log.error("Failed to process booking cancellation notification for booking: {}",
					event.getBooking() != null ? event.getBooking().getId() : "null", e);
		}
	}
}
