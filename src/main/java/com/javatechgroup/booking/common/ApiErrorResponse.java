package com.javatechgroup.booking.common;

import java.time.LocalDateTime;
import java.util.Map;

public class ApiErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String code;
    private String message;
    private Map<String, String> details;

    public ApiErrorResponse() {}

    public ApiErrorResponse(LocalDateTime timestamp, int status, String code, String message, Map<String, String> details) {
        this.timestamp = timestamp;
        this.status = status;
        this.code = code;
        this.message = message;
        this.details = details;
    }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, String> getDetails() { return details; }
    public void setDetails(Map<String, String> details) { this.details = details; }
}
