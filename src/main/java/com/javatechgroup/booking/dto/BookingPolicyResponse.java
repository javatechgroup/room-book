package com.javatechgroup.booking.dto;

import java.time.LocalDateTime;

public class BookingPolicyResponse {

    private Long id;
    private Long companyId;
    private String companyName;
    private Integer maxAdvanceBookingDays;
    private Integer minBookingDurationMinutes;
    private Integer maxBookingDurationHours;
    private Integer cancellationCutoffMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookingPolicyResponse() {}

    public BookingPolicyResponse(Long id, Long companyId, String companyName, Integer maxAdvanceBookingDays,
                                 Integer minBookingDurationMinutes, Integer maxBookingDurationHours,
                                 Integer cancellationCutoffMinutes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.companyName = companyName;
        this.maxAdvanceBookingDays = maxAdvanceBookingDays;
        this.minBookingDurationMinutes = minBookingDurationMinutes;
        this.maxBookingDurationHours = maxBookingDurationHours;
        this.cancellationCutoffMinutes = cancellationCutoffMinutes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Integer getMaxAdvanceBookingDays() { return maxAdvanceBookingDays; }
    public void setMaxAdvanceBookingDays(Integer maxAdvanceBookingDays) { this.maxAdvanceBookingDays = maxAdvanceBookingDays; }

    public Integer getMinBookingDurationMinutes() { return minBookingDurationMinutes; }
    public void setMinBookingDurationMinutes(Integer minBookingDurationMinutes) { this.minBookingDurationMinutes = minBookingDurationMinutes; }

    public Integer getMaxBookingDurationHours() { return maxBookingDurationHours; }
    public void setMaxBookingDurationHours(Integer maxBookingDurationHours) { this.maxBookingDurationHours = maxBookingDurationHours; }

    public Integer getCancellationCutoffMinutes() { return cancellationCutoffMinutes; }
    public void setCancellationCutoffMinutes(Integer cancellationCutoffMinutes) { this.cancellationCutoffMinutes = cancellationCutoffMinutes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
