package com.javatechgroup.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompanyRegistrationRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Company code is required")
    @Size(min = 2, max = 50, message = "Company code must be between 2 and 50 characters")
    private String companyCode;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact information must be a valid email address")
    private String contactInformation;

    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    private String phone;

    @Size(max = 550, message = "Address must not exceed 550 characters")
    private String address;

    private String status = "ACTIVE";

    public CompanyRegistrationRequest() {}

    public CompanyRegistrationRequest(String name, String companyCode, String contactInformation, String phone, String address, String status) {
        this.name = name;
        this.companyCode = companyCode;
        this.contactInformation = contactInformation;
        this.phone = phone;
        this.address = address;
        if (status != null) this.status = status;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setCompanyCode(String companyCode) {
        this.companyCode = companyCode != null ? companyCode.trim().toUpperCase() : null;
    }

    public String getContactInformation() {
        return contactInformation;
    }

    public void setContactInformation(String contactInformation) {
        this.contactInformation = contactInformation;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
