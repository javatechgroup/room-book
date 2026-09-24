package com.javatechgroup.booking.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_policies")
public class BookingPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, unique = true)
    private Company company;

    @Column(name = "max_advance_booking_days")
    private Integer maxAdvanceBookingDays = 30;

    @Column(name = "min_booking_duration_minutes")
    private Integer minBookingDurationMinutes = 30;

    @Column(name = "max_booking_duration_hours")
    private Integer maxBookingDurationHours = 4;

    @Column(name = "cancellation_cutoff_minutes")
    private Integer cancellationCutoffMinutes = 30;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public BookingPolicy() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public Integer getMaxAdvanceBookingDays() { return maxAdvanceBookingDays; }
    public void setMaxAdvanceBookingDays(Integer maxAdvanceBookingDays) { this.maxAdvanceBookingDays = maxAdvanceBookingDays; }

    public Integer getMinBookingDurationMinutes() { return minBookingDurationMinutes; }
    public void setMinBookingDurationMinutes(Integer minBookingDurationMinutes) { this.minBookingDurationMinutes = minBookingDurationMinutes; }

    public Integer getMaxBookingDurationHours() { return maxBookingDurationHours; }
    public void setMaxBookingDurationHours(Integer maxBookingDurationHours) { this.maxBookingDurationHours = maxBookingDurationHours; }

    public Integer getCancellationCutoffMinutes() { return cancellationCutoffMinutes; }
    public void setCancellationCutoffMinutes(Integer cancellationCutoffMinutes) { this.cancellationCutoffMinutes = cancellationCutoffMinutes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
