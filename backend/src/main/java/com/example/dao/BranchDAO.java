package com.example.dao;

import com.example.db.DBConnection;
import com.example.model.Branch;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BranchDAO {

    public List<Branch> getAllBranches() {
        List<Branch> branches = new ArrayList<>();
        String query = "SELECT * FROM branches ORDER BY name ASC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                branches.add(mapResultSetToBranch(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return branches;
    }

    public Branch getBranchById(int id) {
        String query = "SELECT * FROM branches WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToBranch(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean addBranch(Branch branch) {
        String query = "INSERT INTO branches (name, location) VALUES (?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, branch.getName());
            stmt.setString(2, branch.getLocation());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public int deleteBranch(int id) throws SQLException {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Nullify branch_id for members
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE members SET branch_id = NULL WHERE branch_id = ?")) {
                stmt.setInt(1, id);
                stmt.executeUpdate();
            }

            // 2. Nullify branch_id for admins
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE admins SET branch_id = NULL WHERE branch_id = ?")) {
                stmt.setInt(1, id);
                stmt.executeUpdate();
            }

            // 3. Delete related contents
            // Trigger migrations in case columns are missing
            new SermonDAO();
            new AnnouncementDAO();
            new EventDAO();
            new PrayerRequestDAO();

            String[] tables = {"sermons", "announcements", "events", "prayer_requests"};
            for (String table : tables) {
                try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + table + " WHERE branch_id = ?")) {
                    stmt.setInt(1, id);
                    int deleted = stmt.executeUpdate();
                    System.out.println("Deleted " + deleted + " records from " + table + " for branch " + id);
                } catch (SQLException e) {
                    throw new SQLException("Failed to delete records from '" + table + "': " + e.getMessage(), e.getSQLState(), e.getErrorCode());
                }
            }

            // 4. Finally delete the branch
            try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM branches WHERE id = ?")) {
                stmt.setInt(1, id);
                int affected = stmt.executeUpdate();
                conn.commit();
                return affected;
            }
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    e.addSuppressed(ex);
                }
            }
            throw e;
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    // Ignore close error
                }
            }
        }
    }

    private Branch mapResultSetToBranch(ResultSet rs) throws SQLException {
        Branch branch = new Branch();
        branch.setId(rs.getInt("id"));
        branch.setName(rs.getString("name"));
        branch.setLocation(rs.getString("location"));
        Timestamp ts = rs.getTimestamp("created_date");
        if (ts != null) branch.setCreatedDate(ts.toLocalDateTime());
        return branch;
    }
}
