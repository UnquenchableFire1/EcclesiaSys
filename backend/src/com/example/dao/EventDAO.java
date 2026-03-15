package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Event;
import com.example.db.DBConnection;

public class EventDAO {

    public boolean addEvent(Event event) {
        String query = "INSERT INTO events (title, description, event_date, location, document_url, created_by) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, event.getTitle());
            stmt.setString(2, event.getDescription());
            stmt.setObject(3, event.getEventDate());
            stmt.setString(4, event.getLocation());
            stmt.setString(5, event.getDocumentFileUrl());
            stmt.setInt(6, event.getCreatedBy());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("Unknown column 'document_url'")) {
                try (Connection conn = DBConnection.getConnection(); Statement alter = conn.createStatement()) {
                    System.out.println("Applying schema patch: Adding document_url to events table");
                    alter.execute("ALTER TABLE events ADD COLUMN document_url VARCHAR(500)");
                    return addEvent(event); // retry
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            e.printStackTrace();
        }
        return false;
    }

    public Event getEventById(int id) {
        String query = "SELECT * FROM events WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToEvent(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Event> getAllEvents() {
        List<Event> events = new ArrayList<>();
        String query = "SELECT * FROM events ORDER BY event_date ASC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                events.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return events;
    }

    public List<Event> getUpcomingEvents() {
        List<Event> events = new ArrayList<>();
        String query = "SELECT * FROM events WHERE event_date >= NOW() ORDER BY event_date ASC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                events.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return events;
    }

    public boolean updateEvent(Event event) {
        String query = "UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, document_url = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, event.getTitle());
            stmt.setString(2, event.getDescription());
            stmt.setObject(3, event.getEventDate());
            stmt.setString(4, event.getLocation());
            stmt.setString(5, event.getDocumentFileUrl());
            stmt.setInt(6, event.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteEvent(int id) {
        String query = "DELETE FROM events WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Event mapResultSetToEvent(ResultSet rs) throws SQLException {
        Event event = new Event();
        event.setId(rs.getInt("id"));
        event.setTitle(rs.getString("title"));
        event.setDescription(rs.getString("description"));
        event.setEventDate(rs.getTimestamp("event_date").toLocalDateTime());
        event.setLocation(rs.getString("location"));
        // Safely map document_url in case the column doesn't exist yet
        try {
            event.setDocumentFileUrl(rs.getString("document_url"));
        } catch (SQLException e) {
            event.setDocumentFileUrl(null);
        }
        event.setCreatedBy(rs.getInt("created_by"));
        return event;
    }
}
