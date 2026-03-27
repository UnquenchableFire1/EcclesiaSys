package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.NotificationDAO;
import com.example.model.Notification;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @GetMapping("/{userType}/{userId}")
    public Map<String, Object> getNotifications(@PathVariable String userType, @PathVariable int userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotificationDAO dao = new NotificationDAO();
            List<Notification> notifications = dao.getNotifications(userId, userType.toUpperCase());
            response.put("success", true);
            response.put("data", notifications);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving notifications: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}/read")
    public Map<String, Object> markAsRead(@PathVariable int id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int userId = (Integer) request.get("userId");
            String userType = (String) request.get("userType");
            NotificationDAO dao = new NotificationDAO();
            boolean success = dao.markAsRead(id, userId, userType != null ? userType.toUpperCase() : "MEMBER");
            if (success) {
                response.put("success", true);
                response.put("message", "Notification marked as read");
            } else {
                response.put("success", false);
                response.put("message", "Failed to mark notification as read");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating notification: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{userType}/{userId}/read-all")
    public Map<String, Object> markAllAsRead(@PathVariable String userType, @PathVariable int userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotificationDAO dao = new NotificationDAO();
            boolean success = dao.markAllAsRead(userId, userType.toUpperCase());
            if (success) {
                response.put("success", true);
                response.put("message", "All notifications marked as read");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update notifications");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating notifications: " + e.getMessage());
        }
        return response;
    }
}
