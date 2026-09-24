package com.magicbricks.booking.dto;

public class ParticipantDto {

    private Long id;
    private Long userId;
    private String email;
    private String name;
    private Boolean isExternal = false;

    public ParticipantDto() {
    }

    public ParticipantDto(Long id, Long userId, String email, String name, Boolean isExternal) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.isExternal = isExternal;
    }

    public ParticipantDto(String email, String name, Boolean isExternal) {
        this.email = email;
        this.name = name;
        this.isExternal = isExternal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getIsExternal() {
        return isExternal != null ? isExternal : false;
    }

    public void setIsExternal(Boolean isExternal) {
        this.isExternal = isExternal;
    }
}
