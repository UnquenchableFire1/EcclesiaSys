package com.example.dao;

import com.example.db.DBConnection;
import com.example.model.Visitor;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class VisitorDAO {

    public VisitorDAO() {
        ensureVisitorSchema();
    }

    private void ensureVisitorSchema() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS visitors (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "attendance_id INT, " +
                "name VARCHAR(255) NOT NULL, " +
                "phone_number VARCHAR(20), " +
                "email VARCHAR(255), " +
                "visit_type VARCHAR(50), " +
                "follow_up_status VARCHAR(50) DEFAULT 'PENDING', " +
                "notes TEXT, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSql);
            System.out.println("✓ Visitors table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to ensure visitors schema: " + e.getMessage());
        }
    }

    public boolean addVisitor(Visitor visitor) {
        String query = "INSERT INTO visitors (attendance_id, name, phone_number, email, visit_type, follow_up_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (visitor.getAttendanceId() > 0) stmt.setInt(1, visitor.getAttendanceId()); else stmt.setNull(1, Types.INTEGER);
            stmt.setString(2, visitor.getName());
            stmt.setString(3, visitor.getPhoneNumber());
            stmt.setString(4, visitor.getEmail());
            stmt.setString(5, visitor.getVisitType());
            stmt.setString(6, visitor.getFollowUpStatus() != null ? visitor.getFollowUpStatus() : "PENDING");
            stmt.setString(7, visitor.getNotes());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Visitor> getPendingFollowUps() {
        List<Visitor> list = new ArrayList<>();
        String query = "SELECT * FROM visitors WHERE follow_up_status = 'PENDING' ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                list.add(mapResultSetToVisitor(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Visitor> getVisitorsByBranch(int branchId) {
        List<Visitor> list = new ArrayList<>();
        String query = "SELECT v.* FROM visitors v JOIN attendance a ON v.attendance_id = a.id WHERE a.branch_id = ? ORDER BY v.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, branchId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToVisitor(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean updateFollowUpStatus(int visitorId, String status) {
        String query = "UPDATE visitors SET follow_up_status = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, status);
            stmt.setInt(2, visitorId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Visitor mapResultSetToVisitor(ResultSet rs) throws SQLException {
        Visitor v = new Visitor();
        v.setId(rs.getInt("id"));
        v.setAttendanceId(rs.getInt("attendance_id"));
        v.setName(rs.getString("name"));
        v.setPhoneNumber(rs.getString("phone_number"));
        v.setEmail(rs.getString("email"));
        v.setVisitType(rs.getString("visit_type"));
        v.setFollowUpStatus(rs.getString("follow_up_status"));
        v.setNotes(rs.getString("notes"));
        v.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return v;
    }
}
