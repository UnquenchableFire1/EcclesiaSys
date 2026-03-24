package com.example.controller;

import com.example.model.Member;
import com.example.model.PasswordReset;
import com.example.dao.MemberDAO;
import com.example.dao.PasswordResetDAO;
import com.example.service.EmailTemplateService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.mindrot.jbcrypt.BCrypt;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

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
    private EmailTemplateService emailTemplateService;
    
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
                setMessageAndLog(response, "Email address is required");
                return response;
            }
            
            // Check if member exists
            Member member = memberDAO.getMemberByEmail(email);
            if (member == null) {
                // Don't reveal if email exists or not (security best practice)
                response.put("success", true);
                response.put("message", "If this email matches our records, you will receive a 6-digit reset code shortly.");
                return response;
            }
            
            // Generate a 6-digit reset code (valid for 1 hour)
            String token = String.format("%06d", new java.util.Random().nextInt(999999));
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
            
            // Save new password reset token
            PasswordReset reset = new PasswordReset(email, token, expiresAt);
            passwordResetDAO.save(reset);
            
            // Send password reset email
            logger.info("Sending password reset code to: {}", email);
            emailTemplateService.sendPasswordResetEmail(email, member.getName(), token);
            
            // Always return success message to prevent user enumeration
            response.put("success", true);
            response.put("message", "If this email matches our records, you will receive a 6-digit reset code shortly.");
            
            return response;
        } catch (Exception e) {
            logger.error("Error processing password reset request", e);
            response.put("success", false);
            response.put("message", "Error processing request: " + e.getMessage());
            return response;
        }
    }

    private void setMessageAndLog(Map<String, Object> response, String message) {
        response.put("message", message);
        logger.warn(message);
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
            
            // SECURITY: Prevent reusing old password (checking against current stored hash)
            if (BCrypt.checkpw(newPassword, member.getPassword())) {
                response.put("success", false);
                response.put("message", "You cannot use your current password as the new password. Please choose a different one.");
                return response;
            }
            
            // Hash the new password before saving
            String hashedNewPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
            member.setPassword(hashedNewPassword);
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
    
    @PostMapping("/test-email")
    public Map<String, Object> testEmail(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String recipientEmail = request.get("email");
        
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required for test");
            return response;
        }
        
        try {
            logger.info("=== TEST EMAIL REQUEST ===");
            logger.info("Recipient: {}", recipientEmail);
            logger.info("Sender: {}", "benjaminbuckmanjunior@gmail.com");
            
            String testToken = "TEST-123456";
            emailTemplateService.sendPasswordResetEmail(recipientEmail, "Test User", testToken);
            
            logger.info("Test email sent successfully to: {}", recipientEmail);
            response.put("success", true);
            response.put("message", "Test email sent successfully to: " + recipientEmail);
            
            return response;
        } catch (Exception e) {
            logger.error("Test email endpoint error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Test email error: " + e.getMessage());
            return response;
        }
    }
}
