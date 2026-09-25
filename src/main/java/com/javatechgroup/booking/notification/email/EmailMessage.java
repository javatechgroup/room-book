package com.javatechgroup.booking.notification.email;

import java.time.LocalDateTime;

/**
 * Model representing an email message dispatched or simulated by the system.
 */
public class EmailMessage {

    private String id;
    private String recipient;
    private String recipientName;
    private String sender;
    private String subject;
    private String body;
    private String type;
    private LocalDateTime sentAt;
    private boolean simulated;

    public EmailMessage() {
    }

    public EmailMessage(String id, String recipient, String recipientName, String sender,
                        String subject, String body, String type, LocalDateTime sentAt, boolean simulated) {
        this.id = id;
        this.recipient = recipient;
        this.recipientName = recipientName;
        this.sender = sender;
        this.subject = subject;
        this.body = body;
        this.type = type;
        this.sentAt = sentAt;
        this.simulated = simulated;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public boolean isSimulated() {
        return simulated;
    }

    public void setSimulated(boolean simulated) {
        this.simulated = simulated;
    }

    @Override
    public String toString() {
        return "EmailMessage{" +
                "id='" + id + '\'' +
                ", recipient='" + recipient + '\'' +
                ", subject='" + subject + '\'' +
                ", type='" + type + '\'' +
                ", sentAt=" + sentAt +
                '}';
    }
}
