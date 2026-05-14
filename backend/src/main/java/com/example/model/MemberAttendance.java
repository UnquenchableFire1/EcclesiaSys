package com.example.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MemberAttendance {
    private int id;
    private int memberId;
    private int branchId;
    private LocalDate date;
    private LocalDateTime scannedAt;

    public MemberAttendance() {}

    public MemberAttendance(int memberId, int branchId, LocalDate date) {
        this.memberId = memberId;
        this.branchId = branchId;
        this.date = date;
        this.scannedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getMemberId() { return memberId; }
    public void setMemberId(int memberId) { this.memberId = memberId; }

    public int getBranchId() { return branchId; }
    public void setBranchId(int branchId) { this.branchId = branchId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}
