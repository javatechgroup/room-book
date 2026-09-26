package com.javatechgroup.booking.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class BookingPolicyRequest {

    private Long companyId;

    @NotNull(message = "Max advance booking days is required")
    @Min(value = 1, message = "Advance booking must be at least 1 day")
    @Max(value = 365, message = "Advance booking cannot exceed 365 days")
    private Integer maxAdvanceBookingDays;

    @NotNull(message = "Minimum booking duration is required")
    @Min(value = 15, message = "Minimum duration must be at least 15 minutes")
    @Max(value = 1440, message = "Minimum duration cannot exceed 24 hours")
    private Integer minBookingDurationMinutes;

    @NotNull(message = "Maximum booking duration is required")
    @Min(value = 1, message = "Maximum duration must be at least 1 hour")
    @Max(value = 24, message = "Maximum duration cannot exceed 24 hours")
    private Integer maxBookingDurationHours;

    @NotNull(message = "Cancellation cutoff is required")
    @Min(value = 0, message = "Cancellation cutoff cannot be negative")
    @Max(value = 1440, message = "Cancellation cutoff cannot exceed 24 hours")
    private Integer cancellationCutoffMinutes;

    public BookingPolicyRequest() {}

    public BookingPolicyRequest(Long companyId, Integer maxAdvanceBookingDays, Integer minBookingDurationMinutes,
                                Integer maxBookingDurationHours, Integer cancellationCutoffMinutes) {
        this.companyId = companyId;
        this.maxAdvanceBookingDays = maxAdvanceBookingDays;
        this.minBookingDurationMinutes = minBookingDurationMinutes;
        this.maxBookingDurationHours = maxBookingDurationHours;
        this.cancellationCutoffMinutes = cancellationCutoffMinutes;
    }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public Integer getMaxAdvanceBookingDays() { return maxAdvanceBookingDays; }
    public void setMaxAdvanceBookingDays(Integer maxAdvanceBookingDays) { this.maxAdvanceBookingDays = maxAdvanceBookingDays; }

    public Integer getMinBookingDurationMinutes() { return minBookingDurationMinutes; }
    public void setMinBookingDurationMinutes(Integer minBookingDurationMinutes) { this.minBookingDurationMinutes = minBookingDurationMinutes; }

    public Integer getMaxBookingDurationHours() { return maxBookingDurationHours; }
    public void setMaxBookingDurationHours(Integer maxBookingDurationHours) { this.maxBookingDurationHours = maxBookingDurationHours; }

    public Integer getCancellationCutoffMinutes() { return cancellationCutoffMinutes; }
    public void setCancellationCutoffMinutes(Integer cancellationCutoffMinutes) { this.cancellationCutoffMinutes = cancellationCutoffMinutes; }
}
