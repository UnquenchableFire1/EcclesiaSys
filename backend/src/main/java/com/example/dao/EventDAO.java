package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Event;
import com.example.db.DBConnection;

public class EventDAO {
    
    public EventDAO() {
        ensureEventsTableSchema();
    }

    private void ensureEventsTableSchema() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS events (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "title VARCHAR(255) NOT NULL, " +
                "description TEXT, " +
                "event_date DATETIME NOT NULL, " +
                "location VARCHAR(255), " +
                "document_url VARCHAR(500), " +
                "created_by INT, " +
                "branch_id INT, " +
                "created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";

        String[] columnsToAdd = {
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS document_url VARCHAR(500)",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS branch_id INT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by INT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        };
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // 1. Ensure table exists
            stmt.execute(createTableSql);

            // 2. Ensure all columns exist (for migration)
            for (String sql : columnsToAdd) {
                try {
                    stmt.execute(sql);
                } catch (SQLException e) {
                    if (!"42S21".equals(e.getSQLState())) {
                        System.err.println("Event migration error: " + e.getMessage());
                    }
                }
            }
            System.out.println("✓ Events table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to connect for event migration: " + e.getMessage());
        }
    }

    public boolean addEvent(Event event) {
        String query = "INSERT INTO events (title, description, event_date, location, document_url, created_by, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, event.getTitle());
            stmt.setString(2, event.getDescription());
            stmt.setObject(3, event.getEventDate());
            stmt.setString(4, event.getLocation());
            stmt.setString(5, event.getDocumentFileUrl());
            stmt.setInt(6, event.getCreatedBy());
            if (event.getBranchId() != null) stmt.setInt(7, event.getBranchId()); else stmt.setNull(7, Types.INTEGER);
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

    public List<Event> getAllEvents(Integer branchId) {
        List<Event> events = new ArrayList<>();
        String query = branchId == null ? "SELECT * FROM events ORDER BY event_date ASC" : "SELECT * FROM events WHERE (branch_id = ? OR branch_id IS NULL) ORDER BY event_date ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                events.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return events;
    }

    public List<Event> getUpcomingEvents(Integer branchId) {
        List<Event> events = new ArrayList<>();
        String query = branchId == null ? 
            "SELECT * FROM events WHERE event_date >= NOW() ORDER BY event_date ASC" :
            "SELECT * FROM events WHERE event_date >= NOW() AND (branch_id = ? OR branch_id IS NULL) ORDER BY event_date ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                events.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return events;
    }

    public boolean updateEvent(Event event) {
        String query = "UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, document_url = ?, branch_id = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, event.getTitle());
            stmt.setString(2, event.getDescription());
            stmt.setObject(3, event.getEventDate());
            stmt.setString(4, event.getLocation());
            stmt.setString(5, event.getDocumentFileUrl());
            if (event.getBranchId() != null) stmt.setInt(6, event.getBranchId()); else stmt.setNull(6, Types.INTEGER);
            stmt.setInt(7, event.getId());
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
        int bId = rs.getInt("branch_id");
        event.setBranchId(rs.wasNull() ? null : bId);
        return event;
    }
}
