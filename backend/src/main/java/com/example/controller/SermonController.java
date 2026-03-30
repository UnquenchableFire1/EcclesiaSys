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
    public Map<String, Object> getAllSermons(@RequestParam(required = false) Integer branchId) {
        Map<String, Object> response = new HashMap<>();
        try {
            SermonDAO dao = new SermonDAO();
            List<Sermon> sermons = dao.getAllSermons(branchId);
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
            
            // Auto-detect fileType if missing
            if (sermon.getFileType() == null || sermon.getFileType().isEmpty()) {
                if (audioUrl != null && !audioUrl.isEmpty()) {
                    sermon.setFileType("mp3");
                } else if (videoUrl != null && !videoUrl.isEmpty()) {
                    sermon.setFileType("mp4");
                } else {
                    String fPath = (String) request.get("filePath");
                    if (fPath != null) {
                        if (fPath.toLowerCase().endsWith(".mp3")) sermon.setFileType("mp3");
                        else if (fPath.toLowerCase().endsWith(".mp4")) sermon.setFileType("mp4");
                        else sermon.setFileType("unknown");
                    } else {
                        sermon.setFileType("unknown");
                    }
                }
            }
            
            // Safety truncation for fileType (database limit is 100)
            if (sermon.getFileType() != null && sermon.getFileType().length() > 50) {
                sermon.setFileType(sermon.getFileType().substring(0, 50));
            }
            System.out.println("Final resolved fileType: " + sermon.getFileType());
            
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
            
            if (request.containsKey("branchId")) {
                Object bIdObj = request.get("branchId");
                if (bIdObj instanceof Number) {
                    sermon.setBranchId(((Number) bIdObj).intValue());
                }
            }
            
            Object dateObj = request.get("sermonDate");
            if (dateObj != null) {
                if (dateObj instanceof String) {
                    try {
                        String dateStr = ((String) dateObj).trim();
                        if (dateStr.contains("Z") || dateStr.contains("+") || (dateStr.lastIndexOf("-") > 10)) {
                            sermon.setSermonDate(java.time.OffsetDateTime.parse(dateStr).toLocalDateTime());
                        } else {
                            if (!dateStr.contains("T")) {
                                dateStr += "T00:00:00";
                            }
                            sermon.setSermonDate(java.time.LocalDateTime.parse(dateStr));
                        }
                    } catch (Exception e) {
                        System.err.println("Warning: Sermon date parse error, defaulting to now. " + e.getMessage());
                        sermon.setSermonDate(java.time.LocalDateTime.now());
                    }
                } else if (dateObj instanceof java.time.LocalDateTime) {
                    sermon.setSermonDate((java.time.LocalDateTime) dateObj);
                }
            }
            
            SermonDAO dao = new SermonDAO();
            dao.addSermon(sermon); // Now throws SQLException if it fails
            
            // Send email notifications
            try {
                java.util.List<String> memberEmails;
                if (sermon.getBranchId() != null) {
                    memberEmails = memberDao.getActiveMemberEmailsByBranch(sermon.getBranchId());
                } else {
                    memberEmails = memberDao.getAllActiveMemberEmails();
                }
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
                System.err.println("Failed to send sermon email notifications: " + e.getMessage());
            }

            // Send in-app notifications
            try {
                com.example.dao.NotificationDAO notifDao = new com.example.dao.NotificationDAO();
                java.util.List<Integer> memberIds;
                if (sermon.getBranchId() != null) {
                    memberIds = memberDao.getActiveMemberIdsByBranch(sermon.getBranchId());
                } else {
                    memberIds = memberDao.getAllActiveMemberIds();
                }
                String notifTitle = "New Sermon: " + sermon.getTitle();
                String notifMsg = "A new sermon by " + sermon.getSpeaker() + " has been posted. Check it out now!";
                for (int memberId : memberIds) {
                    notifDao.addNotification(memberId, notifTitle, notifMsg, "sermon", "MEMBER");
                }
            } catch (Exception e) {
                System.err.println("Failed to send in-app sermon notifications: " + e.getMessage());
            }

            response.put("success", true);
            response.put("message", "Sermon created successfully");
            response.put("data", sermon);
        } catch (java.sql.SQLException e) {
            response.put("success", false);
            response.put("message", "Database Error: " + e.getMessage());
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
            if (request.containsKey("branchId")) {
                Object bIdObj = request.get("branchId");
                if (bIdObj instanceof Number) {
                    sermon.setBranchId(((Number) bIdObj).intValue());
                }
            }
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
