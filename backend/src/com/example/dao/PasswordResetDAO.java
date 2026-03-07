package com.example.dao;

import com.example.model.PasswordReset;
import com.example.db.DBConnection;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.time.LocalDateTime;

@Repository
public class PasswordResetDAO {
    
    public void save(PasswordReset passwordReset) {
        String query = "INSERT INTO password_resets (email, token, expires_at, created_at) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, passwordReset.getEmail());
            stmt.setString(2, passwordReset.getToken());
            stmt.setObject(3, passwordReset.getExpiresAt());
            stmt.setObject(4, passwordReset.getCreatedAt() != null ? passwordReset.getCreatedAt() : LocalDateTime.now());
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Failed to save password reset token: " + e.getMessage());
        }
    }
    
    public PasswordReset findByToken(String token) {
        String query = "SELECT * FROM password_resets WHERE token = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, token);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                PasswordReset reset = new PasswordReset();
                reset.setId(rs.getInt("id"));
                reset.setEmail(rs.getString("email"));
                reset.setToken(rs.getString("token"));
                reset.setExpiresAt(rs.getObject("expires_at", LocalDateTime.class));
                reset.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
                return reset;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to find password reset token: " + e.getMessage());
        }
        return null;
    }
    
    public void deleteByToken(String token) {
        String query = "DELETE FROM password_resets WHERE token = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, token);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Failed to delete password reset token: " + e.getMessage());
        }
    }
    
    public void deleteExpiredTokens() {
        String query = "DELETE FROM password_resets WHERE expires_at < ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setObject(1, LocalDateTime.now());
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Failed to delete expired tokens: " + e.getMessage());
        }
    }
}
