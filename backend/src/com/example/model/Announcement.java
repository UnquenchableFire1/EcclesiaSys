package com.example.model;

import java.time.LocalDateTime;

public class Announcement {
    private int id;
    private String title;
    private String message;
    private int createdBy;
    private Integer branchId;
    private LocalDateTime createdDate;
    private LocalDateTime updatedAt;
    private String fileUrl;

    public Announcement() {}

    public Announcement(String title, String message, int createdBy) {
        this.title = title;
        this.message = message;
        this.createdBy = createdBy;
    }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    // Jackson-friendly alias expected by frontend
    public LocalDateTime getCreatedAt() { return createdDate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getBranchId() { return branchId; }
    public void setBranchId(Integer branchId) { this.branchId = branchId; }
}
