package com.example.dao;

import com.example.db.DBConnection;
import com.example.model.Message;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MessageDAO {

    public MessageDAO() {
        ensureMessageSchema();
    }

    private void ensureMessageSchema() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS formal_messages (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "sender_id INT NOT NULL, " +
                "receiver_id INT, " +
                "subject VARCHAR(255), " +
                "content TEXT, " +
                "category VARCHAR(50), " +
                "timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "is_read TINYINT(1) DEFAULT 0, " +
                "parent_message_id INT" +
                ")";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSql);
            System.out.println("✓ Formal messages table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to ensure message schema: " + e.getMessage());
        }
    }

    public boolean sendMessage(Message msg) {
        String query = "INSERT INTO formal_messages (sender_id, receiver_id, subject, content, category, parent_message_id) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, msg.getSenderId());
            if (msg.getReceiverId() > 0) stmt.setInt(2, msg.getReceiverId()); else stmt.setNull(2, Types.INTEGER);
            stmt.setString(3, msg.getSubject());
            stmt.setString(4, msg.getContent());
            stmt.setString(5, msg.getCategory());
            if (msg.getParentMessageId() != null) stmt.setInt(6, msg.getParentMessageId()); else stmt.setNull(6, Types.INTEGER);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Message> getMessagesForUser(int userId) {
        List<Message> list = new ArrayList<>();
        String query = "SELECT * FROM formal_messages WHERE receiver_id = ? OR sender_id = ? ORDER BY timestamp DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.setInt(2, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToMessage(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Message> getMessagesByCategory(String category) {
        List<Message> list = new ArrayList<>();
        String query = "SELECT * FROM formal_messages WHERE category = ? ORDER BY timestamp DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, category);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToMessage(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    private Message mapResultSetToMessage(ResultSet rs) throws SQLException {
        Message m = new Message();
        m.setId(rs.getInt("id"));
        m.setSenderId(rs.getInt("sender_id"));
        m.setReceiverId(rs.getInt("receiver_id"));
        m.setSubject(rs.getString("subject"));
        m.setContent(rs.getString("content"));
        m.setCategory(rs.getString("category"));
        m.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
        m.setRead(rs.getBoolean("is_read"));
        int pId = rs.getInt("parent_message_id");
        m.setParentMessageId(rs.wasNull() ? null : pId);
        return m;
    }
}
