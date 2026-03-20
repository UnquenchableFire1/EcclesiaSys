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
        String query = "UPDATE admins SET email = ? WHERE email = 'benjamin@ecclesiasy.com' OR email = 'benjamin@bbj.com' OR id = 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, targetEmail);
            int updated = stmt.executeUpdate();
            if (updated > 0) {
                System.out.println("✓ Synchronized admin email to: " + targetEmail);
            }
        } catch (SQLException e) {
            System.err.println("! Admin email sync skipped: " + e.getMessage());
        }
    }

    public boolean addAdmin(Admin admin) {
        String query = "INSERT INTO admins (name, email, password, created_by, profile_picture_url, gender, bio, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, admin.getName());
            stmt.setString(2, admin.getEmail());
            stmt.setString(3, admin.getPassword());
            stmt.setInt(4, admin.getCreatedBy());
            stmt.setString(5, admin.getProfilePictureUrl());
            stmt.setString(6, admin.getGender());
            stmt.setString(7, admin.getBio());
            stmt.setString(8, admin.getPhoneNumber());
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
                return admin;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
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
                admins.add(admin);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return admins;
    }

    public boolean updateAdmin(Admin admin) {
        String query = "UPDATE admins SET name = ?, email = ?, password = ?, profile_picture_url = ?, gender = ?, bio = ?, phone_number = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, admin.getName());
            stmt.setString(2, admin.getEmail());
            stmt.setString(3, admin.getPassword());
            stmt.setString(4, admin.getProfilePictureUrl());
            stmt.setString(5, admin.getGender());
            stmt.setString(6, admin.getBio());
            stmt.setString(7, admin.getPhoneNumber());
            stmt.setInt(8, admin.getId());
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
}
