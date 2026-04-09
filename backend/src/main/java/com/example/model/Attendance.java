package com.example.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Attendance {
    private int id;
    private int branchId;
    private LocalDate date;
    private int menCount;
    private int womenCount;
    private int childrenCount;
    private int eldersCount;
    private int deaconsCount;
    private int deaconessesCount;
    private int visitorsCount;
    private String visitorType; // 'WORSHIP_WITH_US', 'JUST_VISITED'
    private LocalDateTime createdAt;

    public Attendance() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBranchId() { return branchId; }
    public void setBranchId(int branchId) { this.branchId = branchId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getMenCount() { return menCount; }
    public void setMenCount(int menCount) { this.menCount = menCount; }

    public int getWomenCount() { return womenCount; }
    public void setWomenCount(int womenCount) { this.womenCount = womenCount; }

    public int getChildrenCount() { return childrenCount; }
    public void setChildrenCount(int childrenCount) { this.childrenCount = childrenCount; }

    public int getEldersCount() { return eldersCount; }
    public void setEldersCount(int eldersCount) { this.eldersCount = eldersCount; }

    public int getDeaconsCount() { return deaconsCount; }
    public void setDeaconsCount(int deaconsCount) { this.deaconsCount = deaconsCount; }

    public int getDeaconessesCount() { return deaconessesCount; }
    public void setDeaconessesCount(int deaconessesCount) { this.deaconessesCount = deaconessesCount; }

    public int getTotalOfficers() { 
        return eldersCount + deaconsCount + deaconessesCount; 
    }
    /** No-op: totalOfficers is computed dynamically in getTotalOfficers(). */
    public void setTotalOfficers(int totalOfficers) { /* computed field — not stored */ }

    public int getVisitorsCount() { return visitorsCount; }
    public void setVisitorsCount(int visitorsCount) { this.visitorsCount = visitorsCount; }

    public String getVisitorType() { return visitorType; }
    public void setVisitorType(String visitorType) { this.visitorType = visitorType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
