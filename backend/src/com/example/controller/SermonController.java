package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.SermonDAO;
import com.example.model.Sermon;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sermons")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SermonController {

    @GetMapping
    public Map<String, Object> getAllSermons() {
        Map<String, Object> response = new HashMap<>();
        try {
            SermonDAO dao = new SermonDAO();
            List<Sermon> sermons = dao.getAllSermons();
            response.put("success", true);
            response.put("data", sermons);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getSermonById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            SermonDAO dao = new SermonDAO();
            Sermon sermon = dao.getSermonById(id);
            if (sermon != null) {
                response.put("success", true);
                response.put("data", sermon);
            } else {
                response.put("success", false);
                response.put("message", "Sermon not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping
    public Map<String, Object> createSermon(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Log the incoming request for debugging
            System.out.println("=== Sermon Creation Request ===");
            System.out.println("Request data: " + request);
            
            Sermon sermon = new Sermon();
            sermon.setTitle((String) request.get("title"));
            sermon.setDescription((String) request.get("description"));
            sermon.setSpeaker((String) request.get("speaker"));
            sermon.setFileType((String) request.get("fileType"));
            
            // Handle uploadedBy/createdBy with proper null checking
            Object uploadedByObj = request.get("uploadedBy");
            Object createdByObj = request.get("createdBy");
            
            System.out.println("uploadedBy: " + uploadedByObj + " (type: " + (uploadedByObj != null ? uploadedByObj.getClass().getName() : "null") + ")");
            System.out.println("createdBy: " + createdByObj + " (type: " + (createdByObj != null ? createdByObj.getClass().getName() : "null") + ")");
            
            int uploaderId = 0;
            if (uploadedByObj != null && uploadedByObj instanceof Number) {
                uploaderId = ((Number) uploadedByObj).intValue();
            } else if (createdByObj != null && createdByObj instanceof Number) {
                uploaderId = ((Number) createdByObj).intValue();
            } else {
                // Try parsing from string if needed
                String createdByStr = createdByObj != null ? createdByObj.toString() : null;
                String uploadedByStr = uploadedByObj != null ? uploadedByObj.toString() : null;
                
                if (createdByStr != null && !createdByStr.isEmpty() && !createdByStr.equals("NaN")) {
                    try {
                        uploaderId = Integer.parseInt(createdByStr);
                    } catch (NumberFormatException e) {
                        System.err.println("Could not parse createdBy: " + createdByStr);
                    }
                } else if (uploadedByStr != null && !uploadedByStr.isEmpty() && !uploadedByStr.equals("NaN")) {
                    try {
                        uploaderId = Integer.parseInt(uploadedByStr);
                    } catch (NumberFormatException e) {
                        System.err.println("Could not parse uploadedBy: " + uploadedByStr);
                    }
                }
            }
            
            if (uploaderId <= 0) {
                response.put("success", false);
                response.put("message", "Error: Invalid or missing creator ID. uploadedBy=" + uploadedByObj + ", createdBy=" + createdByObj);
                return response;
            }
            
            sermon.setUploadedBy(uploaderId);
            
            // Handle file URLs - either audioUrl or videoUrl
            String audioUrl = (String) request.get("audioUrl");
            String videoUrl = (String) request.get("videoUrl");
            
            System.out.println("audioUrl: " + audioUrl);
            System.out.println("videoUrl: " + videoUrl);
            
            if (audioUrl != null && !audioUrl.isEmpty()) {
                sermon.setAudioUrl(audioUrl);
                sermon.setFilePath(audioUrl);
            } else if (videoUrl != null && !videoUrl.isEmpty()) {
                sermon.setVideoUrl(videoUrl);
                sermon.setFilePath(videoUrl);
            } else {
                // Fallback to filePath if provided
                String filePath = (String) request.get("filePath");
                sermon.setFilePath(filePath);
                if (filePath != null && !filePath.isEmpty()) {
                    if ("mp3".equals(sermon.getFileType())) {
                        sermon.setAudioUrl(filePath);
                    } else {
                        sermon.setVideoUrl(filePath);
                    }
                }
            }
            
            // Handle sermon date
            Object dateObj = request.get("sermonDate");
            if (dateObj != null) {
                // Convert string date to LocalDateTime if needed
                if (dateObj instanceof String) {
                    sermon.setSermonDate(java.time.LocalDateTime.parse((String) dateObj));
                } else if (dateObj instanceof java.time.LocalDateTime) {
                    sermon.setSermonDate((java.time.LocalDateTime) dateObj);
                }
            }
            
            System.out.println("Creating sermon: " + sermon.getTitle() + " by user " + uploaderId);
            
            SermonDAO dao = new SermonDAO();
            if (dao.addSermon(sermon)) {
                response.put("success", true);
                response.put("message", "Sermon created successfully");
                response.put("data", sermon);
            } else {
                response.put("success", false);
                response.put("message", "Failed to save sermon to database");
            }
        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "Error: Invalid number format - " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateSermon(@PathVariable int id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Sermon sermon = new Sermon(
                    (String) request.get("title"),
                    (String) request.get("description"),
                    (String) request.get("filePath"),
                    (String) request.get("fileType"),
                    ((Number) request.get("uploadedBy")).intValue()
            );
            sermon.setId(id);
            
            SermonDAO dao = new SermonDAO();
            if (dao.updateSermon(sermon)) {
                response.put("success", true);
                response.put("message", "Sermon updated");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update sermon");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteSermon(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            SermonDAO dao = new SermonDAO();
            if (dao.deleteSermon(id)) {
                response.put("success", true);
                response.put("message", "Sermon deleted");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete sermon");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
