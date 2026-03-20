package com.example.model;

import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import java.time.LocalDateTime;

public class ChatMessage {
    @JsonView(Views.Public.class)
    private int id;
    
    @JsonView(Views.Public.class)
    private int senderId;
    
    @JsonView(Views.Public.class)
    private String senderType; // 'member' or 'admin'
    
    @JsonView(Views.Public.class)
    private int receiverId;
    
    @JsonView(Views.Public.class)
    private String receiverType; // 'member' or 'admin'
    
    @JsonView(Views.Public.class)
    private String content;
    
    @JsonView(Views.Public.class)
    private LocalDateTime timestamp;
    
    @JsonView(Views.Public.class)
    private boolean isRead;

    @JsonView(Views.Public.class)
    private String senderName; // Transient for conversation list
    @JsonView(Views.Public.class)
    private int unreadCount;   // Transient for conversation list

    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
    }

    public ChatMessage(int senderId, String senderType, int receiverId, String receiverType, String content) {
        this.senderId = senderId;
        this.senderType = senderType;
        this.receiverId = receiverId;
        this.receiverType = receiverType;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSenderId() { return senderId; }
    public void setSenderId(int senderId) { this.senderId = senderId; }

    public String getSenderType() { return senderType; }
    public void setSenderType(String senderType) { this.senderType = senderType; }

    public int getReceiverId() { return receiverId; }
    public void setReceiverId(int receiverId) { this.receiverId = receiverId; }

    public String getReceiverType() { return receiverType; }
    public void setReceiverType(String receiverType) { this.receiverType = receiverType; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
}
