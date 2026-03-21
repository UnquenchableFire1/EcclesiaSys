package com.example.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

public class PrayerRequest {
    private int id;
    private String requesterName;
    private String email;
    private String requestText;
    private boolean isAnonymous;
    private String status; // PENDING, PRAYED_FOR
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    public PrayerRequest() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRequestText() { return requestText; }
    public void setRequestText(String requestText) { this.requestText = requestText; }

    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { isAnonymous = anonymous; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
