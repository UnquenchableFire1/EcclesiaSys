package com.example.controller;

import com.example.dao.AdminDAO;
import com.example.dao.ChatDAO;
import com.example.model.Admin;
import com.example.model.ChatMessage;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {
    private final ChatDAO chatDAO = new ChatDAO();
    private final AdminDAO adminDAO = new AdminDAO();

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

    @GetMapping("/admin-team")
    public Map<String, Object> getAdminTeam() {
        Map<String, Object> response = new HashMap<>();
        try {
            Admin mainAdmin = adminDAO.getAdminByEmail("benjaminbuckmanjunior@gmail.com");
            if (mainAdmin == null) {
                // Fallback to the first admin in the system if primary is missing
                List<Admin> admins = adminDAO.getAllAdmins();
                if (!admins.isEmpty()) {
                    mainAdmin = admins.get(0);
                }
            }
            
            if (mainAdmin != null) {
                response.put("success", true);
                response.put("adminId", mainAdmin.getId());
                response.put("adminName", mainAdmin.getName());
            } else {
                response.put("success", false);
                response.put("message", "No admin available");
            }
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
            // Safe numeric extraction from JSON (Jackson parses numbers as Long or Double)
            int senderId = ((Number) data.get("senderId")).intValue();
            int receiverId = ((Number) data.get("receiverId")).intValue();
            String content = (String) data.get("content");
            
            // Determine types dynamically or accept them from payload
            String senderType = (String) data.getOrDefault("senderType", "member");
            String receiverType = (String) data.getOrDefault("receiverType", "admin");

            ChatMessage message = new ChatMessage(
                senderId,
                senderType,
                receiverId,
                receiverType,
                content
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
            response.put("message", "Error casting/extracting data: " + e.getMessage());
            e.printStackTrace();
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
