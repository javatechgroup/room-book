package com.javatechgroup.booking.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms", indexes = {
    @Index(name = "idx_rooms_company_id", columnList = "company_id"),
    @Index(name = "idx_rooms_company_status", columnList = "company_id, status"),
    @Index(name = "idx_rooms_company_floor", columnList = "company_id, floor"),
    @Index(name = "idx_rooms_company_status_floor", columnList = "company_id, status, floor"),
    @Index(name = "idx_rooms_company_name", columnList = "company_id, name")
})
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String name;

    private String location;

    private String floor;

    @Column(nullable = false)
    private Integer capacity;

    private String description;

    private String status = "AVAILABLE";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Room() {}

    public Room(Long id, Company company, String name, String location, String floor, Integer capacity, String description, String status) {
        this.id = id;
        this.company = company;
        this.name = name;
        this.location = location;
        this.floor = floor;
        this.capacity = capacity;
        this.description = description;
        if (status != null) this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
