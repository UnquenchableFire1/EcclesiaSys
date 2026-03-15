package com.example.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.JSONObject;
import org.json.JSONArray;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {
    
    @Value("${resend.api-key:null}")
    private String apiKey;
    
    @Value("${resend.sender-email:onboarding@resend.dev}")
    private String senderEmail;
    
    @Value("${app.frontend.url:https://yourbbjdigitalapp.onrender.com}")
    private String frontendUrl;
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    public boolean sendPasswordResetEmail(String recipientEmail, String resetToken, String resetLink) {
        try {
            logger.info("Attempting to send password reset email via Resend to: {}", recipientEmail);
            
            String emailBody = "Hello,\n\n" +
                    "You requested to reset your password for your EcclesiaSys account.\n\n" +
                    "Please click the link below to reset your password:\n" +
                    resetLink + "\n\n" +
                    "Or use this reset code: " + resetToken + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "EcclesiaSys Team";
                    
            return sendEmailViaResend(recipientEmail, "EcclesiaSys - Password Reset Request", emailBody);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: " + recipientEmail + " | Error: " + e.getMessage());
            return false;
        }
    }
    
    public boolean sendVerificationEmail(String recipientEmail, String verificationCode, String verificationLink) {
        try {
            String emailBody = "Hello,\n\n" +
                    "Welcome to EcclesiaSys Church Management System!\n\n" +
                    "Please verify your email address by clicking the link below:\n" +
                    verificationLink + "\n\n" +
                    "Or use this verification code: " + verificationCode + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not create this account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "EcclesiaSys Team";
                    
            return sendEmailViaResend(recipientEmail, "EcclesiaSys - Email Verification", emailBody);
        } catch (Exception e) {
            logger.error("Failed to send verification email to: " + recipientEmail, e);
            return false;
        }
    }
    
    public boolean sendNotificationEmail(String recipientEmail, String subject, String message) {
        try {
            String emailBody = message + "\n\n" +
                    "Best regards,\n" +
                    "EcclesiaSys Team";
                    
            return sendEmailViaResend(recipientEmail, "EcclesiaSys - " + subject, emailBody);
        } catch (Exception e) {
            logger.error("Failed to send notification email to: " + recipientEmail, e);
            return false;
        }
    }
    
    private boolean sendEmailViaResend(String to, String subject, String text) throws Exception {
        if ("null".equals(apiKey) || apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Resend API key is not configured. Email to {} was not sent.", to);
            // In dev without API key, pretend it sent
            return true; 
        }

        JSONObject payload = new JSONObject();
        payload.put("from", "EcclesiaSys <" + senderEmail + ">");
        payload.put("to", new JSONArray().put(to));
        payload.put("subject", subject);
        payload.put("text", text);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            logger.info("Email successfully sent via Resend API to: " + to);
            return true;
        } else {
            logger.error("Failed to send email via Resend API. Status: {}, Body: {}", response.statusCode(), response.body());
            return false;
        }
    }
}
