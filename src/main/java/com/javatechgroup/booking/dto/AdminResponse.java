package com.javatechgroup.booking.dto;

import com.javatechgroup.booking.domain.Role;
import java.time.LocalDateTime;

public class AdminResponse {

    private Long id;
    private String fullName;
    private String email;
    private Long companyId;
    private String companyName;
    private String companyCode;
    private Role role;
    private String status;
    private LocalDateTime createdAt;
    private String lastLogin;

    public AdminResponse() {}

    public AdminResponse(Long id, String fullName, String email, Long companyId, String companyName, String companyCode, Role role, String status, LocalDateTime createdAt, String lastLogin) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.companyId = companyId;
        this.companyName = companyName;
        this.companyCode = companyCode;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setCompanyCode(String companyCode) {
        this.companyCode = companyCode;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }
}
