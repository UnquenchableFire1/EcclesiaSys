package com.example.model;

import java.time.LocalDateTime;

public class PasswordReset {
    private int id;
    private String email;
    private String actualEmail;
    private String token;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public PasswordReset() {}

    public PasswordReset(String email, String actualEmail, String token, LocalDateTime expiresAt) {
        this.email = email;
        this.actualEmail = actualEmail;
        this.token = token;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getActualEmail() { return actualEmail; }
    public void setActualEmail(String actualEmail) { this.actualEmail = actualEmail; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
