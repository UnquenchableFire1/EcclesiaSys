package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.GalleryItem;
import com.example.db.DBConnection;

public class GalleryDAO {

    public GalleryDAO() {
        ensureGalleryTableSchema();
    }

    private void ensureGalleryTableSchema() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS gallery_items (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "title VARCHAR(255) NOT NULL, " +
                "caption TEXT, " +
                "media_url VARCHAR(2000) NOT NULL, " +
                "media_type VARCHAR(20) NOT NULL DEFAULT 'PHOTO', " +
                "is_sermon TINYINT(1) NOT NULL DEFAULT 0, " +
                "folder_name VARCHAR(150), " +
                "branch_id INT, " +
                "uploaded_by INT NOT NULL, " +
                "uploader_name VARCHAR(255), " +
                "uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";

        String[] columnsToAdd = {
            "ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) NOT NULL DEFAULT 'PHOTO'",
            "ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS is_sermon TINYINT(1) NOT NULL DEFAULT 0",
            "ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS folder_name VARCHAR(150)",
            "ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS uploader_name VARCHAR(255)",
            // Rename image_url -> media_url if old table existed
            "ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS media_url VARCHAR(2000) NOT NULL DEFAULT ''"
        };

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.execute(createTableSql);

            for (String sql : columnsToAdd) {
                try {
                    stmt.execute(sql);
                } catch (SQLException e) {
                    if (!"42S21".equals(e.getSQLState())) {
                        System.err.println("Gallery migration warning: " + e.getMessage());
                    }
                }
            }

            System.out.println("✓ Gallery table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to ensure gallery schema: " + e.getMessage());
        }
    }

    /** Insert a new gallery item */
    public boolean addGalleryItem(GalleryItem item) {
        String query = "INSERT INTO gallery_items (title, caption, media_url, media_type, is_sermon, folder_name, branch_id, uploaded_by, uploader_name) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, item.getTitle());
            stmt.setString(2, item.getCaption());
            stmt.setString(3, item.getMediaUrl());
            stmt.setString(4, item.getMediaType() != null ? item.getMediaType() : "PHOTO");
            stmt.setBoolean(5, item.isSermon());
            stmt.setString(6, item.getFolderName());
            if (item.getBranchId() != null) stmt.setInt(7, item.getBranchId()); else stmt.setNull(7, Types.INTEGER);
            stmt.setInt(8, item.getUploadedBy());
            stmt.setString(9, item.getUploaderName());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /** Get all items, optionally filtered by branchId and/or folder */
    public List<GalleryItem> getAllGalleryItems(Integer branchId, String folderName, Boolean sermonsOnly) {
        List<GalleryItem> items = new ArrayList<>();
        StringBuilder sb = new StringBuilder("SELECT * FROM gallery_items WHERE 1=1");

        if (branchId != null) {
            sb.append(" AND (branch_id = ").append(branchId).append(" OR branch_id IS NULL)");
        }
        if (folderName != null && !folderName.isBlank()) {
            sb.append(" AND folder_name = '").append(folderName.replace("'", "''")).append("'");
        }
        if (Boolean.TRUE.equals(sermonsOnly)) {
            sb.append(" AND is_sermon = 1");
        }
        sb.append(" ORDER BY uploaded_at DESC");

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sb.toString())) {

            while (rs.next()) {
                items.add(mapGalleryItem(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return items;
    }

    /** Get distinct folder names for a branch (for album grid view) */
    public List<String> getFolderNames(Integer branchId) {
        List<String> folders = new ArrayList<>();
        String query = branchId != null
            ? "SELECT DISTINCT folder_name FROM gallery_items WHERE folder_name IS NOT NULL AND folder_name <> '' AND (branch_id = ? OR branch_id IS NULL) ORDER BY folder_name ASC"
            : "SELECT DISTINCT folder_name FROM gallery_items WHERE folder_name IS NOT NULL AND folder_name <> '' ORDER BY folder_name ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                folders.add(rs.getString("folder_name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return folders;
    }

    /** Delete a gallery item */
    public boolean deleteGalleryItem(int id) {
        String query = "DELETE FROM gallery_items WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private GalleryItem mapGalleryItem(ResultSet rs) throws SQLException {
        GalleryItem item = new GalleryItem();
        item.setId(rs.getInt("id"));
        item.setTitle(rs.getString("title"));
        item.setCaption(rs.getString("caption"));
        item.setMediaUrl(rs.getString("media_url"));
        item.setMediaType(rs.getString("media_type"));
        item.setSermon(rs.getBoolean("is_sermon"));
        item.setFolderName(rs.getString("folder_name"));
        int bId = rs.getInt("branch_id");
        item.setBranchId(rs.wasNull() ? null : bId);
        item.setUploadedBy(rs.getInt("uploaded_by"));
        item.setUploaderName(rs.getString("uploader_name"));
        Timestamp ts = rs.getTimestamp("uploaded_at");
        if (ts != null) item.setUploadedAt(ts.toLocalDateTime());
        return item;
    }
}
