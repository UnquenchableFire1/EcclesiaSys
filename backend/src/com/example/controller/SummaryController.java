package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.db.DBConnection;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/summary")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SummaryController {

    @GetMapping("/counts")
    public Map<String, Object> getCounts() {
        Map<String, Object> response = new HashMap<>();
        try (Connection conn = DBConnection.getConnection()) {
            Map<String, Integer> counts = new HashMap<>();
            
            counts.put("members", getCount(conn, "SELECT COUNT(*) FROM members WHERE status = 'active'"));
            counts.put("events", getCount(conn, "SELECT COUNT(*) FROM events"));
            counts.put("announcements", getCount(conn, "SELECT COUNT(*) FROM announcements"));
            counts.put("sermons", getCount(conn, "SELECT COUNT(*) FROM sermons"));
            
            response.put("success", true);
            response.put("data", counts);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    private int getCount(Connection conn, String query) throws SQLException {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }
}
