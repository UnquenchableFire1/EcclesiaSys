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
    
    @Value("${brevo.api-key:null}")
    private String apiKey;
    
    @Value("${brevo.sender-email:onboarding@resend.dev}")
    private String senderEmail;
    
    @Value("${app.frontend.url:https://yourbbjdigitalapp.onrender.com}")
    private String frontendUrl;
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    public boolean sendPasswordResetEmail(String recipientEmail, String resetToken, String resetLink) {
        try {
            logger.info("Attempting to send password reset email via Brevo to: {}", recipientEmail);
            
            String emailBody = "Hello,\n\n" +
                    "You requested to reset your password for your COP Ayikai Doblo account.\n\n" +
                    "Please click the link below to reset your password:\n" +
                    resetLink + "\n\n" +
                    "Or use this reset code: " + resetToken + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "COP Ayikai Doblo Team";
                    
            return sendEmailViaBrevo(recipientEmail, "COP Ayikai Doblo - Password Reset Request", emailBody, false);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: " + recipientEmail + " | Error: " + e.getMessage());
            return false;
        }
    }
    
    public boolean sendVerificationEmail(String recipientEmail, String verificationCode, String verificationLink) {
        try {
            String emailBody = "Hello,\n\n" +
                    "Welcome to Church Of Pentecost - Ayikai Doblo District!\n\n" +
                    "Please verify your email address by clicking the link below:\n" +
                    verificationLink + "\n\n" +
                    "Or use this verification code: " + verificationCode + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not create this account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "COP Ayikai Doblo Team";
                    
            return sendEmailViaBrevo(recipientEmail, "COP Ayikai Doblo - Email Verification", emailBody, false);
        } catch (Exception e) {
            logger.error("Failed to send verification email to: " + recipientEmail, e);
            return false;
        }
    }
    
    public boolean sendNotificationEmail(String recipientEmail, String subject, String message) {
        try {
            String emailBody = message + "\n\n" +
                    "Best regards,\n" +
                    "COP Ayikai Doblo Team";
                    
            return sendEmailViaBrevo(recipientEmail, "COP Ayikai Doblo - " + subject, emailBody, false);
        } catch (Exception e) {
            logger.error("Failed to send notification email to: " + recipientEmail, e);
            return false;
        }
    }

    public boolean sendHtmlEmail(String recipientEmail, String subject, String htmlContent) {
        return sendEmailViaBrevo(recipientEmail, subject, htmlContent, true);
    }
    
    private boolean sendEmailViaBrevo(String to, String subject, String content, boolean isHtml) {
        if ("null".equals(apiKey) || apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Brevo API key is not configured. Email to {} was not sent.", to);
            return false; 
        }

        logger.info("=== BREVO ATTEMPT === To: {} | Subject: {} | Sender: {}", to, subject, senderEmail);
        logger.debug("API Key Prefix: {}", (apiKey.length() > 10) ? apiKey.substring(0, 10) : "short-key");

        try {
            JSONObject payload = new JSONObject();
            
            JSONObject sender = new JSONObject();
            sender.put("name", "COP Ayikai Doblo");
            sender.put("email", senderEmail);
            payload.put("sender", sender);
            
            JSONArray toArray = new JSONArray();
            JSONObject toObj = new JSONObject();
            toObj.put("email", to);
            toArray.put(toObj);
            payload.put("to", toArray);
            
            payload.put("subject", subject);
            if (isHtml) {
                payload.put("htmlContent", content);
            } else {
                payload.put("textContent", content);
            }

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey)
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                logger.info("Brevo Success: Status {}, MessageId: {}", response.statusCode(), response.body());
                return true;
            } else {
                logger.error("Brevo Failure: Status {}, Response: {}", response.statusCode(), response.body());
                // Provide hint for unverified sender
                if (response.body().contains("unauthorized") || response.body().contains("sender")) {
                    logger.warn("HINT: Ensure '{}' is a VERIFIED SENDER in your Brevo dashboard.", senderEmail);
                }
                return false;
            }
        } catch (Exception e) {
            logger.error("Internal Error sending email via Brevo: {}", e.getMessage(), e);
            return false;
        }
    }
}
