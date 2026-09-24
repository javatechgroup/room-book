package com.javatechgroup.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class BookingRequest {

    private Long companyId;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotBlank(message = "Meeting title is required")
    @Size(max = 255, message = "Meeting title cannot exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String department;

    private Integer attendeesCount;

    private java.util.List<ParticipantDto> participants = new java.util.ArrayList<>();

    private java.util.List<String> participantEmails = new java.util.ArrayList<>();

    public BookingRequest() {}

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getAttendeesCount() { return attendeesCount; }
    public void setAttendeesCount(Integer attendeesCount) { this.attendeesCount = attendeesCount; }

    public java.util.List<ParticipantDto> getParticipants() { return participants; }
    public void setParticipants(java.util.List<ParticipantDto> participants) { this.participants = participants; }

    public java.util.List<String> getParticipantEmails() { return participantEmails; }
    public void setParticipantEmails(java.util.List<String> participantEmails) { this.participantEmails = participantEmails; }
}
