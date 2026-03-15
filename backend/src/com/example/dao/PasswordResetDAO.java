package com.example.dao;

import com.example.model.PasswordReset;
import com.example.db.DBConnection;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.time.LocalDateTime;

@Repository
public class PasswordResetDAO {
    
    public void save(PasswordReset passwordReset) {
        String query = "INSERT INTO password_resets (email, actual_email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, passwordReset.getEmail());
            stmt.setString(2, passwordReset.getActualEmail());
            stmt.setString(3, passwordReset.getToken());
            stmt.setObject(4, passwordReset.getExpiresAt());
            stmt.setObject(5, passwordReset.getCreatedAt() != null ? passwordReset.getCreatedAt() : LocalDateTime.now());
            stmt.executeUpdate();
        } catch (SQLException e) {
            // If the column actual_email is missing due to an older schema, add it dynamically and retry
            if (e.getMessage() != null && e.getMessage().contains("Unknown column 'actual_email'")) {
                try (Connection conn = DBConnection.getConnection();
                     Statement alterStmt = conn.createStatement()) {
                    System.out.println("Applying schema patch: Adding actual_email to password_resets table");
                    alterStmt.execute("ALTER TABLE password_resets ADD COLUMN actual_email VARCHAR(100)");
                    // Retry the save after altering table
                    save(passwordReset);
                } catch (SQLException ex) {
                    throw new RuntimeException("Failed to patch schema and save password reset token: " + ex.getMessage());
                }
            } else {
                throw new RuntimeException("Failed to save password reset token: " + e.getMessage());
            }
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
                reset.setActualEmail(rs.getString("actual_email"));
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
