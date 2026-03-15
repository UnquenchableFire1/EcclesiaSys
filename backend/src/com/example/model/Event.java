package com.example.model;

import java.time.LocalDateTime;

public class Event {
    private int id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private String documentFileUrl;
    private int createdBy;
    private LocalDateTime createdDate;
    private LocalDateTime updatedAt;

    public Event() {}

    public Event(String title, String description, LocalDateTime eventDate, String location, int createdBy) {
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.location = location;
        this.createdBy = createdBy;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDocumentFileUrl() { return documentFileUrl; }
    public void setDocumentFileUrl(String documentFileUrl) { this.documentFileUrl = documentFileUrl; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
