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
                "user_type VARCHAR(20) DEFAULT 'MEMBER', " +
                "is_read BOOLEAN DEFAULT FALSE, " +
                "created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
                ")";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSQL);
            
            // Migration for existing table
            try {
                stmt.execute("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'MEMBER'");
            } catch (SQLException e) {
                // Ignore if column exists
            }
            System.out.println("✓ Notifications table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to create notifications table: " + e.getMessage());
        }
    }

    public boolean addNotification(int userId, String title, String message, String type, String userType) {
        String query = "INSERT INTO notifications (member_id, title, message, type, user_type, is_read, created_at) VALUES (?, ?, ?, ?, ?, FALSE, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.setString(2, title);
            stmt.setString(3, message);
            stmt.setString(4, type != null ? type : "general");
            stmt.setString(5, userType != null ? userType : "MEMBER");
            stmt.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Notification> getNotifications(int userId, String userType) {
        List<Notification> notifications = new ArrayList<>();
        String query = "SELECT * FROM notifications WHERE member_id = ? AND user_type = ? ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.setString(2, userType != null ? userType : "MEMBER");
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

    public boolean markAsRead(int notificationId, int userId, String userType) {
        String query = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND member_id = ? AND user_type = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, notificationId);
            stmt.setInt(2, userId);
            stmt.setString(3, userType);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean markAllAsRead(int userId, String userType) {
        String query = "UPDATE notifications SET is_read = TRUE WHERE member_id = ? AND user_type = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.setString(2, userType);
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
            if (!addNotification(admin.getId(), title, message, "general", "ADMIN")) {
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
            // Only notify admins assigned to this specific branch
            if (admin.getBranchId() != null && admin.getBranchId() == branchId) {
                if (!addNotification(admin.getId(), title, message, "prayer", "ADMIN")) {
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
