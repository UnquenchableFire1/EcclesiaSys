package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.db.DBConnection;

public class UserProfilePictureDAO {

    public boolean addProfilePicture(int userId, String userType, String url) {
        String query = "INSERT INTO user_profile_pictures (user_id, user_type, url) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.setString(2, userType);
            stmt.setString(3, url);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<String> getProfilePictureHistory(int userId, String userType) {
        List<String> history = new ArrayList<>();
        String query = "SELECT url FROM user_profile_pictures WHERE user_id = ? AND user_type = ? ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.setString(2, userType);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                history.add(rs.getString("url"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return history;
    }

    public boolean deleteProfilePicture(int userId, String userType, String url) {
        String query = "DELETE FROM user_profile_pictures WHERE user_id = ? AND user_type = ? AND url = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.setString(2, userType);
            stmt.setString(3, url);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
