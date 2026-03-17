package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.PrayerRequestDAO;
import com.example.model.PrayerRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prayer-requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PrayerRequestController {

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
}
