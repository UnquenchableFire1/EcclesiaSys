package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.PrayerRequestDAO;
import com.example.model.PrayerRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.service.EmailService;
import com.example.dao.MemberDAO;
import com.example.dao.NotificationDAO;
import com.example.model.Member;

@RestController
@RequestMapping("/api/prayer-requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PrayerRequestController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    public Map<String, Object> submitPrayerRequest(@RequestBody PrayerRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            PrayerRequestDAO dao = new PrayerRequestDAO();
            boolean success = dao.addPrayerRequest(request);
            if (success) {
                response.put("success", true);
                response.put("message", "Prayer request submitted successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to submit prayer request");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping
    public Map<String, Object> getAllPrayerRequests() {
        Map<String, Object> response = new HashMap<>();
        try {
            PrayerRequestDAO dao = new PrayerRequestDAO();
            List<PrayerRequest> requests = dao.getAllPrayerRequests();
            response.put("success", true);
            response.put("data", requests);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving prayer requests: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}/status")
    public Map<String, Object> updateRequestStatus(@PathVariable int id, @RequestBody Map<String, String> statusUpdate) {
        Map<String, Object> response = new HashMap<>();
        try {
            String status = statusUpdate.get("status");
            if (status == null) {
                response.put("success", false);
                response.put("message", "Status is required");
                return response;
            }
            PrayerRequestDAO dao = new PrayerRequestDAO();
            boolean success = dao.updateStatus(id, status);
            if (success) {
                response.put("success", true);
                response.put("message", "Status updated successfully");
                
                try {
                    if ("Answered".equals(status) || "Prayed For".equals(status)) {
                        PrayerRequest request = dao.getPrayerRequestById(id);
                        if (request != null && !request.isAnonymous() && request.getEmail() != null) {
                            String email = request.getEmail();
                            MemberDAO memberDao = new MemberDAO();
                            Member member = memberDao.getMemberByEmail(email);
                            
                            String message = "Your prayer request submitted on " + request.getCreatedAt().toLocalDate() + " has been marked as '" + status + "'. ";
                            if ("Answered".equals(status)) {
                                message += "Praise God for His answered prayers!";
                            } else {
                                message += "We are standing in agreement with you in prayer.";
                            }
                            
                            if (member != null) {
                                NotificationDAO notifDao = new NotificationDAO();
                                notifDao.addNotification(member.getId(), "Prayer Request Update", message);
                            }
                            
                            if (emailService != null) {
                                emailService.sendNotificationEmail(email, "Prayer Request Update", "Hello " + request.getRequesterName() + ",\n\n" + message);
                            }
                        }
                    }
                } catch (Exception notificationError) {
                    System.err.println("Error sending notification for prayer request update: " + notificationError.getMessage());
                }
                
            } else {
                response.put("success", false);
                response.put("message", "Failed to update status");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating status: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteRequest(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            PrayerRequestDAO dao = new PrayerRequestDAO();
            boolean success = dao.deletePrayerRequest(id);
            if (success) {
                response.put("success", true);
                response.put("message", "Prayer request deleted successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete prayer request");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting prayer request: " + e.getMessage());
        }
        return response;
    }
}
