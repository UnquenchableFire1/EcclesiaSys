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
