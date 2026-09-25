package com.javatechgroup.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FloorRequest {

    private Long companyId;

    @NotBlank(message = "Floor name is required")
    @Size(max = 255, message = "Floor name cannot exceed 255 characters")
    private String name;

    private Integer floorNumber;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String status = "ACTIVE";

    public FloorRequest() {}

    public FloorRequest(String name, Integer floorNumber, String description, String status) {
        this.name = name;
        this.floorNumber = floorNumber;
        this.description = description;
        if (status != null) this.status = status;
    }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
