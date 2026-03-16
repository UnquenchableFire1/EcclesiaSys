package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.AnnouncementDAO;
import com.example.model.Announcement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnnouncementController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.service.EmailTemplateService emailService;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.dao.MemberDAO memberDao;


    @GetMapping
    public Map<String, Object> getAllAnnouncements() {
        Map<String, Object> response = new HashMap<>();
        try {
            AnnouncementDAO dao = new AnnouncementDAO();
            List<Announcement> announcements = dao.getAllAnnouncements();
            response.put("success", true);
            response.put("data", announcements);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getAnnouncementById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            AnnouncementDAO dao = new AnnouncementDAO();
            Announcement announcement = dao.getAnnouncementById(id);
            if (announcement != null) {
                response.put("success", true);
                response.put("data", announcement);
            } else {
                response.put("success", false);
                response.put("message", "Announcement not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping
    public Map<String, Object> createAnnouncement(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Announcement announcement = new Announcement(
                    (String) request.get("title"),
                    (String) request.get("message"),
                    ((Number) request.get("createdBy")).intValue()
            );
            if (request.containsKey("fileUrl")) {
                announcement.setFileUrl((String) request.get("fileUrl"));
            }
            
            AnnouncementDAO dao = new AnnouncementDAO();
            if (dao.addAnnouncement(announcement)) {
                // Send email notifications to all active members
                try {
                    java.util.List<String> memberEmails = memberDao.getAllActiveMemberEmails();
                    for (String email : memberEmails) {
                        emailService.sendAnnouncementNotificationEmail(
                            email, 
                            announcement.getTitle(), 
                            announcement.getMessage(),
                            String.valueOf(announcement.getId())
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send announcement notifications: " + e.getMessage());
                }

                response.put("success", true);
                response.put("message", "Announcement created");
            } else {
                response.put("success", false);
                response.put("message", "Failed to create announcement");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateAnnouncement(@PathVariable int id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Announcement announcement = new Announcement(
                    (String) request.get("title"),
                    (String) request.get("message"),
                    ((Number) request.get("createdBy")).intValue()
            );
            announcement.setId(id);
            
            AnnouncementDAO dao = new AnnouncementDAO();
            if (dao.updateAnnouncement(announcement)) {
                response.put("success", true);
                response.put("message", "Announcement updated");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update announcement");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteAnnouncement(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            AnnouncementDAO dao = new AnnouncementDAO();
            if (dao.deleteAnnouncement(id)) {
                response.put("success", true);
                response.put("message", "Announcement deleted");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete announcement");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
