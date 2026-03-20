package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.EventDAO;
import com.example.dao.NotificationDAO;
import com.example.model.Event;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EventController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.service.EmailTemplateService emailService;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.dao.MemberDAO memberDao;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @GetMapping
    public Map<String, Object> getAllEvents() {
        Map<String, Object> response = new HashMap<>();
        try {
            EventDAO dao = new EventDAO();
            List<Event> events = dao.getAllEvents();
            response.put("success", true);
            response.put("data", events);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/upcoming")
    public Map<String, Object> getUpcomingEvents() {
        Map<String, Object> response = new HashMap<>();
        try {
            EventDAO dao = new EventDAO();
            List<Event> events = dao.getUpcomingEvents();
            response.put("success", true);
            response.put("data", events);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getEventById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            EventDAO dao = new EventDAO();
            Event event = dao.getEventById(id);
            if (event != null) {
                response.put("success", true);
                response.put("data", event);
            } else {
                response.put("success", false);
                response.put("message", "Event not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping
    public Map<String, Object> createEvent(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            LocalDateTime eventDate = LocalDateTime.parse(
                    (String) request.get("eventDate"),
                    formatter
            );
            
            Event event = new Event(
                    (String) request.get("title"),
                    (String) request.get("description"),
                    eventDate,
                    (String) request.get("location"),
                    ((Number) request.get("createdBy")).intValue()
            );
            
            EventDAO dao = new EventDAO();
            if (dao.addEvent(event)) {
                // Send email and in-app notifications to all active members
                try {
                    NotificationDAO notificationDao = new NotificationDAO();
                    java.util.List<Integer> memberIds = memberDao.getAllActiveMemberIds();
                    java.util.List<String> memberEmails = memberDao.getAllActiveMemberEmails();
                    
                    // In-app notifications
                    for (Integer memberId : memberIds) {
                        notificationDao.addNotification(
                            memberId, 
                            "Upcoming Event: " + event.getTitle(), 
                            "New event scheduled for " + event.getEventDate().toString() + " at " + event.getLocation()
                        );
                    }

                    // Email notifications
                    for (String email : memberEmails) {
                        emailService.sendEventNotificationEmail(
                            email, 
                            event.getTitle(), 
                            event.getEventDate().toString(), 
                            event.getDescription(), 
                            event.getLocation(),
                            String.valueOf(event.getId())
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send event notifications: " + e.getMessage());
                }

                response.put("success", true);
                response.put("message", "Event created");
            } else {
                response.put("success", false);
                response.put("message", "Failed to create event");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateEvent(@PathVariable int id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            LocalDateTime eventDate = LocalDateTime.parse(
                    (String) request.get("eventDate"),
                    formatter
            );
            
            Event event = new Event(
                    (String) request.get("title"),
                    (String) request.get("description"),
                    eventDate,
                    (String) request.get("location"),
                    ((Number) request.get("createdBy")).intValue()
            );
            event.setId(id);
            
            EventDAO dao = new EventDAO();
            if (dao.updateEvent(event)) {
                response.put("success", true);
                response.put("message", "Event updated");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update event");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteEvent(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            EventDAO dao = new EventDAO();
            if (dao.deleteEvent(id)) {
                response.put("success", true);
                response.put("message", "Event deleted");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete event");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
