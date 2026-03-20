package com.example.controller;

import com.example.dao.ChatDAO;
import com.example.model.ChatMessage;
import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/chat/*")
public class ChatController extends HttpServlet {
    private final ChatDAO chatDAO = new ChatDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        resp.setContentType("application/json");

        if ("/conversations".equals(pathInfo)) {
            int userId = Integer.parseInt(req.getParameter("userId"));
            List<ChatMessage> list = chatDAO.getAdminConversations(userId);
            resp.getWriter().write(gson.toJson(new ApiResponse(true, "Conversations retrieved", list)));
        } else if ("/history".equals(pathInfo)) {
            int user1Id = Integer.parseInt(req.getParameter("user1Id"));
            int user2Id = Integer.parseInt(req.getParameter("user2Id"));
            List<ChatMessage> messages = chatDAO.getConversation(user1Id, user2Id);
            resp.getWriter().write(gson.toJson(new ApiResponse(true, "Messages retrieved", messages)));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        resp.setContentType("application/json");

        if ("/send".equals(pathInfo)) {
            JsonObject data = gson.fromJson(req.getReader(), JsonObject.class);
            ChatMessage message = new ChatMessage(
                data.get("senderId").getAsInt(),
                "member", // Default, can be refined based on session
                data.get("receiverId").getAsInt(),
                "admin",  // Default
                data.get("content").getAsString()
            );

            if (chatDAO.sendMessage(message)) {
                resp.getWriter().write(gson.toJson(new ApiResponse(true, "Message sent", message)));
            } else {
                resp.getWriter().write(gson.toJson(new ApiResponse(false, "Failed to send message", null)));
            }
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        resp.setContentType("application/json");

        if ("/read".equals(pathInfo)) {
            int messageId = Integer.parseInt(req.getParameter("messageId"));
            // We could also mark a whole conversation as read, but for now we follow api.js
            if (chatDAO.markAsRead(messageId)) {
                resp.getWriter().write(gson.toJson(new ApiResponse(true, "Message marked as read", null)));
            } else {
                resp.getWriter().write(gson.toJson(new ApiResponse(false, "Failed to mark as read", null)));
            }
        }
    }

    private static class ApiResponse {
        boolean success;
        String message;
        Object data;

        ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
}
