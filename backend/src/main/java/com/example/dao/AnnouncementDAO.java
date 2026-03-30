package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Announcement;
import com.example.db.DBConnection;

public class AnnouncementDAO {
    
    public AnnouncementDAO() {
        ensureAnnouncementsTableSchema();
    }

    private void ensureAnnouncementsTableSchema() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS announcements (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "title VARCHAR(255) NOT NULL, " +
                "message TEXT NOT NULL, " +
                "created_by INT, " +
                "file_url VARCHAR(500), " +
                "branch_id INT, " +
                "created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";

        String[] columnsToAdd = {
            "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS file_url VARCHAR(500)",
            "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS branch_id INT",
            "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        };
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // 1. Ensure table exists
            stmt.execute(createTableSql);

            // 2. Ensure all columns exist (for migration)
            for (String sql : columnsToAdd) {
                try {
                    stmt.execute(sql);
                } catch (SQLException e) {
                    if (!"42S21".equals(e.getSQLState())) {
                        System.err.println("Announcement migration error: " + e.getMessage());
                    }
                }
            }
            System.out.println("✓ Announcements table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to connect for announcement migration: " + e.getMessage());
        }
    }

    public boolean addAnnouncement(Announcement announcement) {
        String query = "INSERT INTO announcements (title, message, created_by, file_url, branch_id) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, announcement.getTitle());
            stmt.setString(2, announcement.getMessage());
            stmt.setInt(3, announcement.getCreatedBy());
            stmt.setString(4, announcement.getFileUrl());
            if (announcement.getBranchId() != null) stmt.setInt(5, announcement.getBranchId()); else stmt.setNull(5, Types.INTEGER);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("Unknown column 'file_url'")) {
                try (Connection conn = DBConnection.getConnection(); Statement alter = conn.createStatement()) {
                    System.out.println("Applying schema patch: Adding file_url to announcements table");
                    alter.execute("ALTER TABLE announcements ADD COLUMN file_url VARCHAR(500)");
                    return addAnnouncement(announcement); // retry
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            e.printStackTrace();
        }
        return false;
    }

    public Announcement getAnnouncementById(int id) {
        String query = "SELECT * FROM announcements WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToAnnouncement(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Announcement> getAllAnnouncements(Integer branchId) {
        List<Announcement> announcements = new ArrayList<>();
        String query = branchId == null ? "SELECT * FROM announcements ORDER BY created_date DESC" : "SELECT * FROM announcements WHERE (branch_id = ? OR branch_id IS NULL) ORDER BY created_date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                announcements.add(mapResultSetToAnnouncement(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return announcements;
    }

    public boolean updateAnnouncement(Announcement announcement) {
        String query = "UPDATE announcements SET title = ?, message = ?, branch_id = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, announcement.getTitle());
            stmt.setString(2, announcement.getMessage());
            if (announcement.getBranchId() != null) stmt.setInt(3, announcement.getBranchId()); else stmt.setNull(3, Types.INTEGER);
            stmt.setInt(4, announcement.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteAnnouncement(int id) {
        String query = "DELETE FROM announcements WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Announcement mapResultSetToAnnouncement(ResultSet rs) throws SQLException {
        Announcement announcement = new Announcement();
        announcement.setId(rs.getInt("id"));
        announcement.setTitle(rs.getString("title"));
        announcement.setMessage(rs.getString("message"));
        announcement.setCreatedBy(rs.getInt("created_by"));
        try {
            Timestamp ts = rs.getTimestamp("created_date");
            if (ts != null) announcement.setCreatedDate(ts.toLocalDateTime());
        } catch (SQLException ex) {
            // column may not exist in older schemas
        }
        try {
            Timestamp ut = rs.getTimestamp("updated_at");
            if (ut != null) announcement.setUpdatedAt(ut.toLocalDateTime());
        } catch (SQLException ex) {
            // ignore
        }
        try {
            String fileUrl = rs.getString("file_url");
            if (fileUrl != null) announcement.setFileUrl(fileUrl);
        } catch (SQLException ex) {
            // ignore if column missing
        }
        int bId = rs.getInt("branch_id");
        announcement.setBranchId(rs.wasNull() ? null : bId);
        return announcement;
    }
}
