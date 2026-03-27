package com.example.dao;

import com.example.db.DBConnection;
import com.example.model.ChatMessage;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChatDAO {

    public boolean sendMessage(ChatMessage message) {
        String query = "INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, content, timestamp, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, message.getSenderId());
            stmt.setString(2, message.getSenderType());
            stmt.setInt(3, message.getReceiverId());
            stmt.setString(4, message.getReceiverType());
            stmt.setString(5, message.getContent());
            stmt.setTimestamp(6, Timestamp.valueOf(message.getTimestamp()));
            stmt.setBoolean(7, message.isRead());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<ChatMessage> getConversation(int userId1, int userId2) {
        List<ChatMessage> messages = new ArrayList<>();
        String query = "SELECT * FROM chat_messages WHERE " +
                       "(sender_id = ? AND receiver_id = ?) OR " +
                       "(sender_id = ? AND receiver_id = ?) " +
                       "ORDER BY timestamp ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId1);
            stmt.setInt(2, userId2);
            stmt.setInt(3, userId2);
            stmt.setInt(4, userId1);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                messages.add(mapResultSetToMessage(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return messages;
    }

    public List<ChatMessage> getAdminConversations(int adminId) {
        List<ChatMessage> list = new ArrayList<>();
        // Get the latest message per unique member conversation, with member name and unread count
        String query = 
            "SELECT cm.*, u.firstName, u.lastName, " +
            "(SELECT COUNT(*) FROM chat_messages WHERE sender_id = cm.sender_id AND sender_type = 'member' AND receiver_id = ? AND receiver_type = 'admin' AND is_read = false) as unread_count " +
            "FROM chat_messages cm " +
            "JOIN members u ON u.id = (CASE WHEN cm.sender_type = 'member' THEN cm.sender_id ELSE cm.receiver_id END) " +
            "WHERE cm.id IN ( " +
            "  SELECT MAX(id) FROM chat_messages " +
            "  WHERE (receiver_id = ? AND receiver_type = 'admin') OR (sender_id = ? AND sender_type = 'admin') " +
            "  GROUP BY CASE WHEN sender_type = 'member' THEN sender_id ELSE receiver_id END " +
            ") " +
            "ORDER BY cm.timestamp DESC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, adminId);
            stmt.setInt(2, adminId);
            stmt.setInt(3, adminId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                ChatMessage msg = mapResultSetToMessage(rs);
                msg.setSenderName(rs.getString("firstName") + " " + rs.getString("lastName"));
                msg.setUnreadCount(rs.getInt("unread_count"));
                list.add(msg);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean markAsRead(int messageId) {
        String query = "UPDATE chat_messages SET is_read = true WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, messageId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private ChatMessage mapResultSetToMessage(ResultSet rs) throws SQLException {
        ChatMessage message = new ChatMessage();
        message.setId(rs.getInt("id"));
        message.setSenderId(rs.getInt("sender_id"));
        message.setSenderType(rs.getString("sender_type"));
        message.setReceiverId(rs.getInt("receiver_id"));
        message.setReceiverType(rs.getString("receiver_type"));
        message.setContent(rs.getString("content"));
        message.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
        message.setRead(rs.getBoolean("is_read"));
        return message;
    }
}
