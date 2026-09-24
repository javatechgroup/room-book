package com.javatechgroup.booking.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_participants", indexes = {
    @Index(name = "idx_participants_booking_id", columnList = "booking_id"),
    @Index(name = "idx_participants_email", columnList = "email")
})
public class BookingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String email;

    private String name;

    @Column(name = "is_external")
    private Boolean isExternal = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public BookingParticipant() {
    }

    public BookingParticipant(Booking booking, User user, String email, String name, Boolean isExternal) {
        this.booking = booking;
        this.user = user;
        this.email = email != null ? email.trim().toLowerCase() : null;
        this.name = name != null ? name.trim() : null;
        this.isExternal = isExternal != null ? isExternal : false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim().toLowerCase() : null;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getIsExternal() {
        return isExternal != null ? isExternal : false;
    }

    public void setIsExternal(Boolean isExternal) {
        this.isExternal = isExternal;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
