package com.javatechgroup.booking.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies", indexes = {
    @Index(name = "idx_companies_status", columnList = "status"),
    @Index(name = "idx_companies_name", columnList = "name"),
    @Index(name = "idx_companies_status_name", columnList = "status, name"),
    @Index(name = "idx_companies_status_created_at", columnList = "status, created_at"),
    @Index(name = "idx_companies_id_name", columnList = "id, name")
})
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "company_code", nullable = false, unique = true)
    private String companyCode;

    @Column(name = "contact_information")
    private String contactInformation;

    @Column(name = "phone")
    private String phone;

    private String address;

    private String status = "ACTIVE";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Company() {}

    public Company(Long id, String name, String companyCode, String contactInformation, String phone, String address, String status) {
        this.id = id;
        this.name = name;
        this.companyCode = companyCode;
        this.contactInformation = contactInformation;
        this.phone = phone;
        this.address = address;
        if (status != null) this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCompanyCode() { return companyCode; }
    public void setCompanyCode(String companyCode) { this.companyCode = companyCode; }

    public String getContactInformation() { return contactInformation; }
    public void setContactInformation(String contactInformation) { this.contactInformation = contactInformation; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
