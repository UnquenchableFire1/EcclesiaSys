package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender javaMailSender;
    
    @Value("${spring.mail.username}")
    private String senderEmail;
    
    @Value("${app.frontend.url:https://yourbbjdigitalapp.onrender.com}")
    private String frontendUrl;
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    public boolean sendPasswordResetEmail(String recipientEmail, String resetToken, String resetLink) {
        try {
            logger.info("Attempting to send password reset email to: {}", recipientEmail);
            logger.info("Reset link: {}", resetLink);
            logger.info("Using mail sender: {}", senderEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(recipientEmail);
            message.setSubject("EcclesiaSys - Password Reset Request");
            
            String emailBody = "Hello,\n\n" +
                    "You requested to reset your password for your EcclesiaSys account.\n\n" +
                    "Please click the link below to reset your password:\n" +
                    resetLink + "\n\n" +
                    "Or use this reset code: " + resetToken + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "EcclesiaSys Team";
            
            message.setText(emailBody);
            
            javaMailSender.send(message);
            logger.info("Password reset email sent successfully to: " + recipientEmail);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: " + recipientEmail + " | Error: " + e.getMessage());
            logger.error("Exception type: " + e.getClass().getName());
            logger.error("Full error details:", e);
            return false;
        }
    }
    
    public boolean sendVerificationEmail(String recipientEmail, String verificationCode, String verificationLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(recipientEmail);
            message.setSubject("EcclesiaSys - Email Verification");
            
            String emailBody = "Hello,\n\n" +
                    "Welcome to EcclesiaSys Church Management System!\n\n" +
                    "Please verify your email address by clicking the link below:\n" +
                    verificationLink + "\n\n" +
                    "Or use this verification code: " + verificationCode + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not create this account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "EcclesiaSys Team";
            
            message.setText(emailBody);
            
            javaMailSender.send(message);
            logger.info("Verification email sent successfully to: " + recipientEmail);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send verification email to: " + recipientEmail, e);
            return false;
        }
    }
    
    public boolean sendNotificationEmail(String recipientEmail, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(senderEmail);
            mailMessage.setTo(recipientEmail);
            mailMessage.setSubject("EcclesiaSys - " + subject);
            
            String emailBody = message + "\n\n" +
                    "Best regards,\n" +
                    "EcclesiaSys Team";
            
            mailMessage.setText(emailBody);
            
            javaMailSender.send(mailMessage);
            logger.info("Notification email sent successfully to: " + recipientEmail);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send notification email to: " + recipientEmail, e);
            return false;
        }
    }
}
