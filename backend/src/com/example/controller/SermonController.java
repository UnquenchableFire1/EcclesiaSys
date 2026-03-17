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

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.service.EmailTemplateService emailService;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.dao.MemberDAO memberDao;

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
            System.out.println("=== Sermon Creation Request ===");
            System.out.println("Request data: " + request);
            
            Sermon sermon = new Sermon();
            sermon.setTitle((String) request.get("title"));
            sermon.setDescription((String) request.get("description"));
            sermon.setSpeaker((String) request.get("speaker"));
            sermon.setFileType((String) request.get("fileType"));
            
            Object uploadedByObj = request.get("uploadedBy");
            Object createdByObj = request.get("createdBy");
            
            int uploaderId = 0;
            if (uploadedByObj != null && uploadedByObj instanceof Number) {
                uploaderId = ((Number) uploadedByObj).intValue();
            } else if (createdByObj != null && createdByObj instanceof Number) {
                uploaderId = ((Number) createdByObj).intValue();
            } else {
                String createdByStr = createdByObj != null ? createdByObj.toString() : null;
                String uploadedByStr = uploadedByObj != null ? uploadedByObj.toString() : null;
                
                if (createdByStr != null && !createdByStr.isEmpty() && !createdByStr.equals("NaN")) {
                    try { uploaderId = Integer.parseInt(createdByStr); } catch (NumberFormatException e) {}
                } else if (uploadedByStr != null && !uploadedByStr.isEmpty() && !uploadedByStr.equals("NaN")) {
                    try { uploaderId = Integer.parseInt(uploadedByStr); } catch (NumberFormatException e) {}
                }
            }
            
            if (uploaderId <= 0) {
                response.put("success", false);
                response.put("message", "Error: Invalid or missing creator ID.");
                return response;
            }
            
            sermon.setUploadedBy(uploaderId);
            
            String audioUrl = (String) request.get("audioUrl");
            String videoUrl = (String) request.get("videoUrl");
            
            if (audioUrl != null && !audioUrl.isEmpty()) {
                sermon.setAudioUrl(audioUrl);
                sermon.setFilePath(audioUrl);
            } else if (videoUrl != null && !videoUrl.isEmpty()) {
                sermon.setVideoUrl(videoUrl);
                sermon.setFilePath(videoUrl);
            } else {
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
            
            Object dateObj = request.get("sermonDate");
            if (dateObj != null) {
                if (dateObj instanceof String) {
                    String dateStr = ((String) dateObj).trim();
                    if (!dateStr.contains("T")) {
                        dateStr += "T00:00:00";
                    }
                    sermon.setSermonDate(java.time.LocalDateTime.parse(dateStr));
                } else if (dateObj instanceof java.time.LocalDateTime) {
                    sermon.setSermonDate((java.time.LocalDateTime) dateObj);
                }
            }
            
            SermonDAO dao = new SermonDAO();
            if (dao.addSermon(sermon)) {
                try {
                    java.util.List<String> memberEmails = memberDao.getAllActiveMemberEmails();
                    for (String email : memberEmails) {
                        emailService.sendSermonNotificationEmail(
                            email, 
                            sermon.getTitle(), 
                            sermon.getSpeaker(), 
                            sermon.getDescription(),
                            String.valueOf(sermon.getId())
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send sermon notifications: " + e.getMessage());
                }

                response.put("success", true);
                response.put("message", "Sermon created successfully");
                response.put("data", sermon);
            } else {
                response.put("success", false);
                response.put("message", "Failed to save sermon to database");
            }
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

    @PostMapping("/migrate")
    public Map<String, Object> migrateSermons() {
        Map<String, Object> response = new HashMap<>();
        try {
            new SermonDAO(); // Constructor triggers migration
            response.put("success", true);
            response.put("message", "Sermon schema migration triggered successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Migration failed: " + e.getMessage());
        }
        return response;
    }
}
