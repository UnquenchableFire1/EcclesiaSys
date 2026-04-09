package com.example.dao;

import com.example.db.DBConnection;
import com.example.model.Attendance;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AttendanceDAO {

    public AttendanceDAO() {
        ensureAttendanceSchema();
    }

    private void ensureAttendanceSchema() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS attendance (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "branch_id INT NOT NULL, " +
                "attendance_date DATE NOT NULL, " +
                "men_count INT DEFAULT 0, " +
                "women_count INT DEFAULT 0, " +
                "children_count INT DEFAULT 0, " +
                "elders_count INT DEFAULT 0, " +
                "deacons_count INT DEFAULT 0, " +
                "deaconesses_count INT DEFAULT 0, " +
                "total_officers INT DEFAULT 0, " +
                "visitors_count INT DEFAULT 0, " +
                "visitor_type VARCHAR(50), " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSql);
            System.out.println("✓ Attendance table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to ensure attendance schema: " + e.getMessage());
        }
    }

    public int addAttendance(Attendance attendance) throws SQLException {
        String query = "INSERT INTO attendance (branch_id, attendance_date, men_count, women_count, children_count, elders_count, deacons_count, deaconesses_count, total_officers, visitors_count, visitor_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, attendance.getBranchId());
            stmt.setDate(2, Date.valueOf(attendance.getDate()));
            stmt.setInt(3, attendance.getMenCount());
            stmt.setInt(4, attendance.getWomenCount());
            stmt.setInt(5, attendance.getChildrenCount());
            stmt.setInt(6, attendance.getEldersCount());
            stmt.setInt(7, attendance.getDeaconsCount());
            stmt.setInt(8, attendance.getDeaconessesCount());
            stmt.setInt(9, attendance.getTotalOfficers());
            stmt.setInt(10, attendance.getVisitorsCount());
            stmt.setString(11, attendance.getVisitorType());
            
            stmt.executeUpdate();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    public List<Attendance> getAttendanceByBranch(int branchId) {
        List<Attendance> list = new ArrayList<>();
        String query = "SELECT * FROM attendance WHERE branch_id = ? ORDER BY attendance_date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToAttendance(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    private Attendance mapResultSetToAttendance(ResultSet rs) throws SQLException {
        Attendance a = new Attendance();
        a.setId(rs.getInt("id"));
        a.setBranchId(rs.getInt("branch_id"));
        a.setDate(rs.getDate("attendance_date").toLocalDate());
        a.setMenCount(rs.getInt("men_count"));
        a.setWomenCount(rs.getInt("women_count"));
        a.setChildrenCount(rs.getInt("children_count"));
        a.setEldersCount(rs.getInt("elders_count"));
        a.setDeaconsCount(rs.getInt("deacons_count"));
        a.setDeaconessesCount(rs.getInt("deaconesses_count"));
        a.setTotalOfficers(rs.getInt("total_officers"));
        a.setVisitorsCount(rs.getInt("visitors_count"));
        a.setVisitorType(rs.getString("visitor_type"));
        a.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return a;
    }
}
