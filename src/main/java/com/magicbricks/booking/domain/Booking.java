package com.magicbricks.booking.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_room_status_time", columnList = "room_id, status, start_time, end_time"),
    @Index(name = "idx_bookings_company_status_time", columnList = "company_id, status, start_time, end_time"),
    @Index(name = "idx_bookings_company_time", columnList = "company_id, start_time, end_time"),
    @Index(name = "idx_bookings_booker_id", columnList = "booker_id"),
    @Index(name = "idx_bookings_company_status", columnList = "company_id, status"),
    @Index(name = "idx_bookings_room_id", columnList = "room_id")
})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booker_id", nullable = false)
    private User booker;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    private String status = "CONFIRMED";

    @Column(name = "department")
    private String department;

    @Column(name = "attendees_count")
    private Integer attendeesCount;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<BookingParticipant> participants = new java.util.ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Booking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public User getBooker() { return booker; }
    public void setBooker(User booker) { this.booker = booker; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getAttendeesCount() { return attendeesCount; }
    public void setAttendeesCount(Integer attendeesCount) { this.attendeesCount = attendeesCount; }

    public java.util.List<BookingParticipant> getParticipants() { return participants; }
    public void setParticipants(java.util.List<BookingParticipant> participants) { this.participants = participants; }

    public void addParticipant(BookingParticipant participant) {
        participants.add(participant);
        participant.setBooking(this);
    }

    public void removeParticipant(BookingParticipant participant) {
        participants.remove(participant);
        participant.setBooking(null);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
