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
        String createTableSql = "CREATE TABLE IF NOT EXISTS sermons (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "title VARCHAR(255) NOT NULL, " +
                "description TEXT, " +
                "speaker VARCHAR(100), " +
                "sermon_date DATETIME, " +
                "file_path VARCHAR(1000), " +
                "audio_url VARCHAR(1000), " +
                "video_url VARCHAR(1000), " +
                "file_type VARCHAR(100), " +
                "uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "uploaded_by INT, " +
                "branch_id INT" +
                ")";
        
        String[] columnsToAdd = {
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS speaker VARCHAR(100)",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS sermon_date DATETIME",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS audio_url VARCHAR(1000)",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000)",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS uploaded_by INT",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS branch_id INT",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS file_type VARCHAR(100)",
                "ALTER TABLE sermons ADD COLUMN IF NOT EXISTS file_path VARCHAR(1000)"
        };
        
        // Forceful modifications to ensure column sizes are correct
        String[] columnsToModify = {
                "ALTER TABLE sermons MODIFY COLUMN file_type VARCHAR(100)",
                "ALTER TABLE sermons MODIFY COLUMN file_path VARCHAR(1000)",
                "ALTER TABLE sermons MODIFY COLUMN audio_url VARCHAR(1000)",
                "ALTER TABLE sermons MODIFY COLUMN video_url VARCHAR(1000)"
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
                    // Ignore if column already exists
                    if (!"42S21".equals(e.getSQLState())) {
                        System.err.println("Migration error (add): " + e.getMessage());
                    }
                }
            }
            
            // 3. Force modify column sizes
            for (String sql : columnsToModify) {
                try {
                    stmt.execute(sql);
                } catch (SQLException e) {
                    System.err.println("Migration error (modify): " + e.getMessage());
                }
            }
            
            System.out.println("✓ Sermon schema migration check completed");
        } catch (SQLException e) {
            System.err.println("Failed to connect for schema migration: " + e.getMessage());
        }
    }

    public void addSermon(Sermon sermon) throws SQLException {
        String query = "INSERT INTO sermons (title, description, speaker, sermon_date, file_path, audio_url, video_url, file_type, uploaded_by, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            
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
            
            System.out.println("Executing query: " + query);
            stmt.executeUpdate();
            
            // Get the generated ID
            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    sermon.setId(generatedKeys.getInt(1));
                }
            } catch (SQLException e) {
                // Ignore if not supported, but log it
                System.err.println("Could not retrieve generated key: " + e.getMessage());
            }
        }
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
