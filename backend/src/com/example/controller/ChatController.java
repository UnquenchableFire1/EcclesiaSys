package com.example.controller;

import com.example.dao.ChatDAO;
import com.example.model.ChatMessage;
import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {
    private final ChatDAO chatDAO = new ChatDAO();

    @GetMapping("/conversations")
    public Map<String, Object> getConversations(@RequestParam int userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ChatMessage> list = chatDAO.getAdminConversations(userId);
            response.put("success", true);
            response.put("message", "Conversations retrieved");
            response.put("data", list);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/history")
    public Map<String, Object> getHistory(@RequestParam int user1Id, @RequestParam int user2Id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ChatMessage> messages = chatDAO.getConversation(user1Id, user2Id);
            response.put("success", true);
            response.put("message", "Messages retrieved");
            response.put("data", messages);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/send")
    public Map<String, Object> sendMessage(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            ChatMessage message = new ChatMessage(
                (Integer) data.get("senderId"),
                "member",
                (Integer) data.get("receiverId"),
                "admin",
                (String) data.get("content")
            );

            if (chatDAO.sendMessage(message)) {
                response.put("success", true);
                response.put("message", "Message sent");
                response.put("data", message);
            } else {
                response.put("success", false);
                response.put("message", "Failed to send message");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/read")
    public Map<String, Object> markAsRead(@RequestParam int messageId) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (chatDAO.markAsRead(messageId)) {
                response.put("success", true);
                response.put("message", "Message marked as read");
            } else {
                response.put("success", false);
                response.put("message", "Failed to mark as read");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
