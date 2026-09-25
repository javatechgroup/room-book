package com.javatechgroup.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BulkStatusUpdateRequest {

    @NotEmpty(message = "At least one ID must be provided")
    private List<Long> ids;

    @NotNull(message = "Status cannot be null")
    private String status;

    public BulkStatusUpdateRequest() {
    }

    public BulkStatusUpdateRequest(List<Long> ids, String status) {
        this.ids = ids;
        this.status = status;
    }

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
