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

    @GetMapping("/member/{memberId}")
    public Map<String, Object> getNotifications(@PathVariable int memberId) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotificationDAO dao = new NotificationDAO();
            List<Notification> notifications = dao.getNotificationsForMember(memberId);
            response.put("success", true);
            response.put("data", notifications);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving notifications: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}/read")
    public Map<String, Object> markAsRead(@PathVariable int id, @RequestBody Map<String, Integer> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int memberId = request.get("memberId");
            NotificationDAO dao = new NotificationDAO();
            boolean success = dao.markAsRead(id, memberId);
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

    @PutMapping("/member/{memberId}/read-all")
    public Map<String, Object> markAllAsRead(@PathVariable int memberId) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotificationDAO dao = new NotificationDAO();
            boolean success = dao.markAllAsRead(memberId);
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
