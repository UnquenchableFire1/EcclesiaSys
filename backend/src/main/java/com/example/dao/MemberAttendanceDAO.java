package com.example.dao;

import com.example.db.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
public class MemberAttendanceDAO {

    public MemberAttendanceDAO() {
        ensureTableSchema();
    }

    private void ensureTableSchema() {
        String sql = "CREATE TABLE IF NOT EXISTS member_attendance (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "member_id INT NOT NULL, " +
                "branch_id INT NOT NULL, " +
                "date DATE NOT NULL, " +
                "scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "UNIQUE KEY unique_checkin (member_id, date)" +
                ")";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            System.out.println("✓ Member Attendance table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to create member_attendance table: " + e.getMessage());
        }
    }

    public boolean recordCheckIn(int memberId, int branchId, LocalDate date) {
        String query = "INSERT INTO member_attendance (member_id, branch_id, date) VALUES (?, ?, ?) " +
                       "ON DUPLICATE KEY UPDATE scanned_at = CURRENT_TIMESTAMP";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, memberId);
            stmt.setInt(2, branchId);
            stmt.setDate(3, Date.valueOf(date));
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Integer> getCheckedInMemberIds(int branchId, LocalDate date) {
        List<Integer> ids = new ArrayList<>();
        String query = "SELECT member_id FROM member_attendance WHERE branch_id = ? AND date = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, branchId);
            stmt.setDate(2, Date.valueOf(date));
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ids.add(rs.getInt("member_id"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return ids;
    }

    public List<com.example.model.MemberAttendance> getAttendanceByMemberId(int memberId) {
        List<com.example.model.MemberAttendance> list = new ArrayList<>();
        String query = "SELECT * FROM member_attendance WHERE member_id = ? ORDER BY date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, memberId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    com.example.model.MemberAttendance ma = new com.example.model.MemberAttendance();
                    ma.setId(rs.getInt("id"));
                    ma.setMemberId(rs.getInt("member_id"));
                    ma.setBranchId(rs.getInt("branch_id"));
                    ma.setDate(rs.getDate("date").toLocalDate());
                    ma.setScannedAt(rs.getTimestamp("scanned_at").toLocalDateTime());
                    list.add(ma);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}
