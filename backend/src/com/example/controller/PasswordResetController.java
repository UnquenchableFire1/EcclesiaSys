package com.example.controller;

import com.example.model.Member;
import com.example.model.PasswordReset;
import com.example.dao.MemberDAO;
import com.example.dao.PasswordResetDAO;
import com.example.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "*"})
public class PasswordResetController {
    
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);
    
    @Autowired
    private MemberDAO memberDAO;
    
    @Autowired
    private PasswordResetDAO passwordResetDAO;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String email = request.get("email");
        
        try {
            // Validate email format
            if (email == null || email.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return response;
            }
            
            // Check if member exists
            Member member = memberDAO.getMemberByEmail(email);
            if (member == null) {
                // Don't reveal if email exists or not (security best practice)
                response.put("success", true);
                response.put("message", "If this email exists, you will receive a reset link");
                return response;
            }
            
            // Generate reset token (valid for 1 hour)
            String token = UUID.randomUUID().toString();
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
            
            // Delete any existing reset tokens for this email
            PasswordReset existingReset = passwordResetDAO.findByToken(token);
            if (existingReset != null) {
                passwordResetDAO.deleteByToken(existingReset.getToken());
            }
            
            // Save new password reset token with both generated email and actual email
            PasswordReset reset = new PasswordReset(email, member.getActualEmail(), token, expiresAt);
            passwordResetDAO.save(reset);
            
            // Send password reset email with the reset link
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            boolean emailSent = emailService.sendPasswordResetEmail(member.getActualEmail(), token, resetLink);
            
            if (emailSent) {
                logger.info("Password reset email sent successfully to: {}", member.getActualEmail());
            } else {
                logger.warn("Failed to send password reset email to: {}", member.getActualEmail());
            }
            
            // Always return success message (don't reveal if email exists - security best practice)
            response.put("success", true);
            response.put("message", "If this email exists, you will receive a reset link");
            
            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error processing password reset request: " + e.getMessage());
            return response;
        }
    }
    
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        try {
            // Validate inputs
            if (token == null || token.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Reset token is required");
                return response;
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "New password is required");
                return response;
            }
            
            if (newPassword.length() < 6) {
                response.put("success", false);
                response.put("message", "Password must be at least 6 characters long");
                return response;
            }
            
            // Find the password reset token
            PasswordReset reset = passwordResetDAO.findByToken(token);
            if (reset == null) {
                response.put("success", false);
                response.put("message", "Invalid or expired reset token");
                return response;
            }
            
            // Check if token has expired
            if (LocalDateTime.now().isAfter(reset.getExpiresAt())) {
                passwordResetDAO.deleteByToken(token);
                response.put("success", false);
                response.put("message", "Reset token has expired");
                return response;
            }
            
            // Get member and update password
            Member member = memberDAO.getMemberByEmail(reset.getEmail());
            if (member == null) {
                response.put("success", false);
                response.put("message", "Member not found");
                return response;
            }
            
            // Update password using MemberDAO
            member.setPassword(newPassword);
            boolean updateSuccess = memberDAO.updateMember(member);
            
            if (!updateSuccess) {
                response.put("success", false);
                response.put("message", "Failed to update password");
                return response;
            }
            
            // Delete the used token
            passwordResetDAO.deleteByToken(token);
            
            response.put("success", true);
            response.put("message", "Password reset successfully");
            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error resetting password: " + e.getMessage());
            return response;
        }
    }
}
