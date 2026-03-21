package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import com.example.model.Notification;
import com.example.db.DBConnection;

public class NotificationDAO {

    public NotificationDAO() {
        ensureNotificationsTableSchema();
    }

    private void ensureNotificationsTableSchema() {
        String createTableSQL = "CREATE TABLE IF NOT EXISTS notifications (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "member_id INT NOT NULL, " +
                "title VARCHAR(255) NOT NULL, " +
                "message TEXT NOT NULL, " +
                "type VARCHAR(50) DEFAULT 'general', " +
                "is_read BOOLEAN DEFAULT FALSE, " +
                "created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
                ")";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSQL);
            System.out.println("✓ Notifications table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to create notifications table: " + e.getMessage());
        }
    }

    public boolean addNotification(int memberId, String title, String message, String type) {
        String query = "INSERT INTO notifications (member_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, FALSE, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, memberId);
            stmt.setString(2, title);
            stmt.setString(3, message);
            stmt.setString(4, type != null ? type : "general");
            stmt.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Notification> getNotificationsForMember(int memberId) {
        List<Notification> notifications = new ArrayList<>();
        String query = "SELECT * FROM notifications WHERE member_id = ? ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, memberId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    notifications.add(mapResultSetToNotification(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return notifications;
    }

    public boolean markAsRead(int notificationId, int memberId) {
        String query = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND member_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, notificationId);
            stmt.setInt(2, memberId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean markAllAsRead(int memberId) {
        String query = "UPDATE notifications SET is_read = TRUE WHERE member_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, memberId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean notifyAllAdmins(String title, String message) {
        AdminDAO adminDao = new AdminDAO();
        List<com.example.model.Admin> admins = adminDao.getAllAdmins();
        boolean allSuccess = true;
        for (com.example.model.Admin admin : admins) {
            if (!addNotification(admin.getId(), title, message, "general")) {
                allSuccess = false;
            }
        }
        return allSuccess;
    }

    public boolean notifyAdminsByBranch(String title, String message, int branchId) {
        AdminDAO adminDao = new AdminDAO();
        List<com.example.model.Admin> admins = adminDao.getAllAdmins();
        boolean allSuccess = true;
        for (com.example.model.Admin admin : admins) {
            // Include branch admins of this branch OR Super Admins (optional, but requested only branch admins)
            if (admin.getBranchId() != null && admin.getBranchId() == branchId) {
                if (!addNotification(admin.getId(), title, message, "general")) {
                    allSuccess = false;
                }
            }
        }
        return allSuccess;
    }

    private Notification mapResultSetToNotification(ResultSet rs) throws SQLException {
        Notification n = new Notification();
        n.setId(rs.getInt("id"));
        n.setMemberId(rs.getInt("member_id"));
        n.setTitle(rs.getString("title"));
        n.setMessage(rs.getString("message"));
        n.setType(rs.getString("type"));
        n.setRead(rs.getBoolean("is_read"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            n.setCreatedAt(ts.toLocalDateTime());
        }
        return n;
    }
}
