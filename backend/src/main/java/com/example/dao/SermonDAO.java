package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Sermon;
import com.example.db.DBConnection;

public class SermonDAO {
    
    public SermonDAO() {
        // Automatic migration to ensure schema matches code
        ensureSermonsTableSchema();
    }

    private void ensureSermonsTableSchema() {
        String[] columnsToAdd = {
            "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS speaker VARCHAR(100)",
            "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS sermon_date DATETIME",
            "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500)",
            "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)",
            "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS uploaded_by INT"
        };
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            for (String sql : columnsToAdd) {
                try {
                    stmt.execute(sql);
                } catch (SQLException e) {
                    // Ignore if column already exists (for DBs that don't support IF NOT EXISTS on ALTER)
                    if (!e.getSQLState().equals("42S21")) { // Duplicate column name
                        System.err.println("Migration error: " + e.getMessage());
                    }
                }
            }
            System.out.println("✓ Sermon schema migration check completed");
        } catch (SQLException e) {
            System.err.println("Failed to connect for schema migration: " + e.getMessage());
        }
    }

    public boolean addSermon(Sermon sermon) {
        String query = "INSERT INTO sermons (title, description, speaker, sermon_date, file_path, audio_url, video_url, file_type, uploaded_by, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, sermon.getTitle());
            stmt.setString(2, sermon.getDescription());
            stmt.setString(3, sermon.getSpeaker());
            stmt.setTimestamp(4, sermon.getSermonDate() != null ? Timestamp.valueOf(sermon.getSermonDate()) : null);
            stmt.setString(5, sermon.getFilePath());
            stmt.setString(6, sermon.getAudioUrl());
            stmt.setString(7, sermon.getVideoUrl());
            stmt.setString(8, sermon.getFileType());
            stmt.setInt(9, sermon.getUploadedBy());
            if (sermon.getBranchId() != null) stmt.setInt(10, sermon.getBranchId()); else stmt.setNull(10, Types.INTEGER);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public Sermon getSermonById(int id) {
        String query = "SELECT * FROM sermons WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToSermon(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Sermon> getAllSermons(Integer branchId) {
        List<Sermon> sermons = new ArrayList<>();
        String query = branchId == null ? "SELECT * FROM sermons ORDER BY uploaded_date DESC" : "SELECT * FROM sermons WHERE (branch_id = ? OR branch_id IS NULL) ORDER BY uploaded_date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                sermons.add(mapResultSetToSermon(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return sermons;
    }

    public List<Sermon> getSermonsByAdmin(int adminId) {
        List<Sermon> sermons = new ArrayList<>();
        String query = "SELECT * FROM sermons WHERE uploaded_by = ? ORDER BY uploaded_date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, adminId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                sermons.add(mapResultSetToSermon(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return sermons;
    }

    public boolean updateSermon(Sermon sermon) {
        String query = "UPDATE sermons SET title = ?, description = ?, speaker = ?, sermon_date = ?, file_path = ?, audio_url = ?, video_url = ?, file_type = ?, branch_id = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, sermon.getTitle());
            stmt.setString(2, sermon.getDescription());
            stmt.setString(3, sermon.getSpeaker());
            stmt.setTimestamp(4, sermon.getSermonDate() != null ? Timestamp.valueOf(sermon.getSermonDate()) : null);
            stmt.setString(5, sermon.getFilePath());
            stmt.setString(6, sermon.getAudioUrl());
            stmt.setString(7, sermon.getVideoUrl());
            stmt.setString(8, sermon.getFileType());
            if (sermon.getBranchId() != null) stmt.setInt(9, sermon.getBranchId()); else stmt.setNull(9, Types.INTEGER);
            stmt.setInt(10, sermon.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteSermon(int id) {
        String query = "DELETE FROM sermons WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Sermon mapResultSetToSermon(ResultSet rs) throws SQLException {
        Sermon sermon = new Sermon();
        sermon.setId(rs.getInt("id"));
        sermon.setTitle(rs.getString("title"));
        sermon.setDescription(rs.getString("description"));
        sermon.setSpeaker(rs.getString("speaker"));
        Timestamp sermonDate = rs.getTimestamp("sermon_date");
        if (sermonDate != null) {
            sermon.setSermonDate(sermonDate.toLocalDateTime());
        }
        sermon.setFilePath(rs.getString("file_path"));
        sermon.setAudioUrl(rs.getString("audio_url"));
        sermon.setVideoUrl(rs.getString("video_url"));
        sermon.setFileType(rs.getString("file_type"));
        sermon.setUploadedBy(rs.getInt("uploaded_by"));
        int bId = rs.getInt("branch_id");
        sermon.setBranchId(rs.wasNull() ? null : bId);
        Timestamp uploadedDate = rs.getTimestamp("uploaded_date");
        if (uploadedDate != null) {
            sermon.setUploadedDate(uploadedDate.toLocalDateTime());
        }
        return sermon;
    }
}
