package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Admin;
import com.example.db.DBConnection;

public class AdminDAO {
    
    public AdminDAO() {
        syncAdminEmail();
    }

    private void syncAdminEmail() {
        String targetEmail = "benjaminbuckmanjunior@gmail.com";
        // Include the variant ecclesisasys (three s) and ecclesiasy (two s)
        String query = "UPDATE admins SET email = ?, role = 'SUPER_ADMIN', branch_id = NULL WHERE email = 'benjamin@ecclesiasy.com' OR email = 'benjamin@ecclesisasys.com' OR email = 'benjamin@bbj.com' OR id = 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, targetEmail);
            int updated = stmt.executeUpdate();
            if (updated > 0) {
                System.out.println("[OK] Synchronized admin email to: " + targetEmail);
            }
        } catch (SQLException e) {
            System.err.println("! Admin email sync skipped: " + e.getMessage());
        }
    }

    public boolean addAdmin(Admin admin) {
        String query = "INSERT INTO admins (name, email, password, role, branch_id, created_by, profile_picture_url, gender, bio, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, admin.getName());
            stmt.setString(2, admin.getEmail());
            stmt.setString(3, admin.getPassword());
            stmt.setString(4, admin.getRole() != null ? admin.getRole() : "BRANCH_ADMIN");
            if (admin.getBranchId() != null) stmt.setInt(5, admin.getBranchId()); else stmt.setNull(5, Types.INTEGER);
            stmt.setInt(6, admin.getCreatedBy());
            stmt.setString(7, admin.getProfilePictureUrl());
            stmt.setString(8, admin.getGender());
            stmt.setString(9, admin.getBio());
            stmt.setString(10, admin.getPhoneNumber());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public Admin getAdminById(int id) {
        String query = "SELECT * FROM admins WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Admin admin = new Admin();
                admin.setId(rs.getInt("id"));
                admin.setName(rs.getString("name"));
                admin.setEmail(rs.getString("email"));
                admin.setPassword(rs.getString("password"));
                admin.setCreatedBy(rs.getInt("created_by"));
                admin.setProfilePictureUrl(rs.getString("profile_picture_url"));
                admin.setGender(rs.getString("gender"));
                admin.setBio(rs.getString("bio"));
                admin.setPhoneNumber(rs.getString("phone_number"));
                admin.setRole(rs.getString("role"));
                int bId = rs.getInt("branch_id");
                admin.setBranchId(rs.wasNull() ? null : bId);
                return admin;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Admin getAdminByEmail(String email) {
        String query = "SELECT * FROM admins WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Admin admin = new Admin();
                admin.setId(rs.getInt("id"));
                admin.setName(rs.getString("name"));
                admin.setEmail(rs.getString("email"));
                admin.setPassword(rs.getString("password"));
                admin.setCreatedBy(rs.getInt("created_by"));
                admin.setProfilePictureUrl(rs.getString("profile_picture_url"));
                admin.setGender(rs.getString("gender"));
                admin.setBio(rs.getString("bio"));
                admin.setPhoneNumber(rs.getString("phone_number"));
                admin.setRole(rs.getString("role"));
                int bId = rs.getInt("branch_id");
                admin.setBranchId(rs.wasNull() ? null : bId);
                return admin;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Admin> getAdminsByBranch(int branchId) {
        List<Admin> admins = new ArrayList<>();
        String query = "SELECT * FROM admins WHERE branch_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Admin admin = new Admin();
                admin.setId(rs.getInt("id"));
                admin.setName(rs.getString("name"));
                admin.setEmail(rs.getString("email"));
                admin.setPassword(rs.getString("password"));
                admin.setCreatedBy(rs.getInt("created_by"));
                admin.setProfilePictureUrl(rs.getString("profile_picture_url"));
                admin.setGender(rs.getString("gender"));
                admin.setBio(rs.getString("bio"));
                admin.setPhoneNumber(rs.getString("phone_number"));
                admin.setRole(rs.getString("role"));
                admin.setBranchId(branchId);
                admins.add(admin);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return admins;
    }

    public List<Admin> getAllAdmins() {
        List<Admin> admins = new ArrayList<>();
        String query = "SELECT * FROM admins";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                Admin admin = new Admin();
                admin.setId(rs.getInt("id"));
                admin.setName(rs.getString("name"));
                admin.setEmail(rs.getString("email"));
                admin.setPassword(rs.getString("password"));
                admin.setCreatedBy(rs.getInt("created_by"));
                admin.setProfilePictureUrl(rs.getString("profile_picture_url"));
                admin.setGender(rs.getString("gender"));
                admin.setBio(rs.getString("bio"));
                admin.setPhoneNumber(rs.getString("phone_number"));
                admin.setRole(rs.getString("role"));
                int bId = rs.getInt("branch_id");
                admin.setBranchId(rs.wasNull() ? null : bId);
                admins.add(admin);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return admins;
    }

    public boolean updateAdmin(Admin admin) {
        String query = "UPDATE admins SET name = ?, email = ?, password = ?, role = ?, branch_id = ?, profile_picture_url = ?, gender = ?, bio = ?, phone_number = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, admin.getName());
            stmt.setString(2, admin.getEmail());
            stmt.setString(3, admin.getPassword());
            stmt.setString(4, admin.getRole());
            if (admin.getBranchId() != null) stmt.setInt(5, admin.getBranchId()); else stmt.setNull(5, Types.INTEGER);
            stmt.setString(6, admin.getProfilePictureUrl());
            stmt.setString(7, admin.getGender());
            stmt.setString(8, admin.getBio());
            stmt.setString(9, admin.getPhoneNumber());
            stmt.setInt(10, admin.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteAdmin(int id) {
        String query = "DELETE FROM admins WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean verifyAdminLogin(String email, String password) {
        String query = "SELECT * FROM admins WHERE email = ? AND password = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateAdminPassword(int id, String newPassword) {
        String query = "UPDATE admins SET password = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, newPassword);
            stmt.setInt(2, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    public boolean isSuperAdmin(int id) {
        Admin admin = getAdminById(id);
        return admin != null && "benjaminbuckmanjunior@gmail.com".equals(admin.getEmail());
    }

    public boolean promoteMemberToAdmin(int memberId, int promotedById, Integer explicitBranchId) {
        String findMember = "SELECT * FROM members WHERE id = ?";
        String insertAdmin = "INSERT INTO admins (name, email, password, role, branch_id, created_by) VALUES (?, ?, ?, 'BRANCH_ADMIN', ?, ?)";
        
        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmt1 = conn.prepareStatement(findMember)) {
                stmt1.setInt(1, memberId);
                ResultSet rs = stmt1.executeQuery();
                if (rs.next()) {
                    String name = rs.getString("first_name") + " " + rs.getString("last_name");
                    String email = rs.getString("email");
                    String password = rs.getString("password");
                    
                    int branchIdToUse;
                    boolean hasBranch;
                    
                    if (explicitBranchId != null) {
                        branchIdToUse = explicitBranchId;
                        hasBranch = true;
                    } else {
                        branchIdToUse = rs.getInt("branch_id");
                        hasBranch = !rs.wasNull();
                    }

                    try (PreparedStatement stmt2 = conn.prepareStatement(insertAdmin)) {
                        stmt2.setString(1, name);
                        stmt2.setString(2, email);
                        stmt2.setString(3, password);
                        if (hasBranch) stmt2.setInt(4, branchIdToUse); else stmt2.setNull(4, Types.INTEGER);
                        stmt2.setInt(5, promotedById);
                        
                        int affected = stmt2.executeUpdate();
                        if (affected > 0) {
                            conn.commit();
                            return true;
                        }
                    }
                }
            }
            conn.rollback();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
