package com.example.model;

import java.time.LocalDateTime;

public class Visitor {
    private int id;
    private int attendanceId;
    private String name;
    private String phoneNumber;
    private String email;
    private String visitType; // 'WORSHIP_WITH_US', 'JUST_VISITING'
    private String followUpStatus; // 'PENDING', 'CONTACTED', 'JOINED'
    private String notes;
    private LocalDateTime createdAt;

    public Visitor() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getAttendanceId() { return attendanceId; }
    public void setAttendanceId(int attendanceId) { this.attendanceId = attendanceId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getVisitType() { return visitType; }
    public void setVisitType(String visitType) { this.visitType = visitType; }

    public String getFollowUpStatus() { return followUpStatus; }
    public void setFollowUpStatus(String followUpStatus) { this.followUpStatus = followUpStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
