package com.example.model;

import java.time.LocalDateTime;

public class Message {
    private int id;
    private int senderId;
    private int receiverId;
    private String subject;
    private String content;
    private String category; // 'ADMIN_COMMUNICATION', 'SECRETARY_COMMUNICATION', 'MEDIA_COMMUNICATION'
    private LocalDateTime timestamp;
    private boolean isRead;
    private Integer parentMessageId; // For threading

    public Message() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSenderId() { return senderId; }
    public void setSenderId(int senderId) { this.senderId = senderId; }

    public int getReceiverId() { return receiverId; }
    public void setReceiverId(int receiverId) { this.receiverId = receiverId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Integer getParentMessageId() { return parentMessageId; }
    public void setParentMessageId(Integer parentMessageId) { this.parentMessageId = parentMessageId; }
}
