package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import com.example.model.PrayerRequest;
import com.example.db.DBConnection;

public class PrayerRequestDAO {

    public PrayerRequestDAO() {
        ensurePrayerRequestsTableSchema();
    }

    private void ensurePrayerRequestsTableSchema() {
        String createTableSQL = "CREATE TABLE IF NOT EXISTS prayer_requests (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "requester_name VARCHAR(100), " +
                "email VARCHAR(100), " +
                "request_text TEXT, " +
                "is_anonymous BOOLEAN DEFAULT FALSE, " +
                "status VARCHAR(20) DEFAULT 'PENDING', " +
                "branch_id INT, " +
                "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "FOREIGN KEY (branch_id) REFERENCES branches(id)" +
                ")";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSQL);
            System.out.println("✓ Prayer requests table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to create prayer_requests table: " + e.getMessage());
        }
    }

    public boolean addPrayerRequest(PrayerRequest request) {
        String query = "INSERT INTO prayer_requests (requester_name, email, request_text, is_anonymous, status, branch_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, request.getRequesterName());
            stmt.setString(2, request.getEmail());
            stmt.setString(3, request.getRequestText());
            stmt.setBoolean(4, request.isAnonymous());
            stmt.setString(5, request.getStatus() != null ? request.getStatus() : "PENDING");
            if (request.getBranchId() != null) stmt.setInt(6, request.getBranchId()); else stmt.setNull(6, Types.INTEGER);
            stmt.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now()));
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<PrayerRequest> getAllPrayerRequests(Integer branchId) {
        List<PrayerRequest> requests = new ArrayList<>();
        String query = branchId == null ? "SELECT * FROM prayer_requests ORDER BY created_at DESC" : "SELECT * FROM prayer_requests WHERE branch_id = ? ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                requests.add(mapResultSetToPrayerRequest(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return requests;
    }

    public boolean updateStatus(int id, String status) {
        String query = "UPDATE prayer_requests SET status = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, status);
            stmt.setInt(2, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public PrayerRequest getPrayerRequestById(int id) {
        String query = "SELECT * FROM prayer_requests WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToPrayerRequest(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean deletePrayerRequest(int id) {
        String query = "DELETE FROM prayer_requests WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private PrayerRequest mapResultSetToPrayerRequest(ResultSet rs) throws SQLException {
        PrayerRequest request = new PrayerRequest();
        request.setId(rs.getInt("id"));
        request.setRequesterName(rs.getString("requester_name"));
        request.setEmail(rs.getString("email"));
        request.setRequestText(rs.getString("request_text"));
        request.setAnonymous(rs.getBoolean("is_anonymous"));
        request.setStatus(rs.getString("status"));
        int bId = rs.getInt("branch_id");
        if (!rs.wasNull()) request.setBranchId(bId);
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            request.setCreatedAt(ts.toLocalDateTime());
        }
        return request;
    }
}
