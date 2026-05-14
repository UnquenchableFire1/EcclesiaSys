package com.example.dao;

import com.example.db.DBConnection;
import com.example.model.AuditLog;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AuditLogDAO {

    public AuditLogDAO() {
        ensureAuditLogsTableSchema();
    }

    private void ensureAuditLogsTableSchema() {
        String createTableSQL = "CREATE TABLE IF NOT EXISTS audit_logs (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "admin_id INT, " +
                "admin_name VARCHAR(150), " +
                "action VARCHAR(100), " +
                "target_type VARCHAR(50), " +
                "target_id VARCHAR(50), " +
                "details TEXT, " +
                "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP" +
                ")";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSQL);
            System.out.println("✓ Audit Logs table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to create audit_logs table: " + e.getMessage());
        }
    }

    public boolean logAction(AuditLog log) {
        String query = "INSERT INTO audit_logs (admin_id, admin_name, action, target_type, target_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, log.getAdminId());
            stmt.setString(2, log.getAdminName());
            stmt.setString(3, log.getAction());
            stmt.setString(4, log.getTargetType());
            stmt.setString(5, log.getTargetId());
            stmt.setString(6, log.getDetails());
            stmt.setTimestamp(7, Timestamp.valueOf(log.getTimestamp() != null ? log.getTimestamp() : LocalDateTime.now()));
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<AuditLog> getAllLogs(int limit) {
        List<AuditLog> logs = new ArrayList<>();
        String query = "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, limit);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    AuditLog log = new AuditLog();
                    log.setId(rs.getInt("id"));
                    log.setAdminId(rs.getInt("admin_id"));
                    log.setAdminName(rs.getString("admin_name"));
                    log.setAction(rs.getString("action"));
                    log.setTargetType(rs.getString("target_type"));
                    log.setTargetId(rs.getString("target_id"));
                    log.setDetails(rs.getString("details"));
                    Timestamp ts = rs.getTimestamp("timestamp");
                    if (ts != null) log.setTimestamp(ts.toLocalDateTime());
                    logs.add(log);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return logs;
    }
}
