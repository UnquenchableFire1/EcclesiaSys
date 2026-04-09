package com.example.controller;

import com.example.dao.MessageDAO;
import com.example.model.Message;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {

    private final MessageDAO messageDAO = new MessageDAO();

    @PostMapping("/send")
    public Map<String, Object> sendMessage(@RequestBody Message msg) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean sent = messageDAO.sendMessage(msg);
            response.put("success", sent);
            response.put("message", sent ? "Message sent successfully!" : "Failed to send message.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/user/{userId}")
    public Map<String, Object> getInbox(@PathVariable int userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Message> messages = messageDAO.getMessagesForUser(userId);
            response.put("success", true);
            response.put("data", messages);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/category/{category}")
    public Map<String, Object> getCategoryInbox(@PathVariable String category) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Message> messages = messageDAO.getMessagesByCategory(category);
            response.put("success", true);
            response.put("data", messages);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
