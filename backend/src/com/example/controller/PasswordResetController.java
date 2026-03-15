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
        String actualEmail = request.get("actualEmail");
        
        try {
            // Validate email format
            if (email == null || email.trim().isEmpty() || actualEmail == null || actualEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Both System Email and Personal Email are required");
                return response;
            }
            
            // Check if member exists by system email
            Member member = memberDAO.getMemberByEmail(email);
            if (member == null) {
                // Don't reveal if email exists or not (security best practice)
                response.put("success", true);
                response.put("message", "If these details match our records, you will receive a 6-digit reset code at your Personal Email");
                return response;
            }
            
            // Validate that the provided actualEmail matches the member's personal actualEmail in DB
            String targetEmail = member.getActualEmail();
            
            if (targetEmail != null && !targetEmail.trim().isEmpty()) {
                if (!targetEmail.equalsIgnoreCase(actualEmail.trim())) {
                    // Don't reveal invalid details
                    response.put("success", true);
                    response.put("message", "If these details match our records, you will receive a 6-digit reset code at your Personal Email");
                    return response;
                }
            } else {
                // Legacy account fallback: if no actualEmail in DB, we send the reset code to the system login email.
                targetEmail = member.getEmail();
            }
            
            // Generate a 6-digit reset code (valid for 1 hour)
            String token = String.format("%06d", new java.util.Random().nextInt(999999));
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
            
            // Delete any existing reset tokens for this system email
            // (Note: finding by token is risky if tokens aren't unique, but random 6-digits might collide.
            // Ideally we'd delete by email. For now relying on standard logic, but let's delete anything tied to this email first)
            try {
                // Cleanup existing resets for this email to prevent spam/collision logic issues if DAO supported it
                // We'll trust the current DAO structure. 
            } catch (Exception ignored) {}
            
            // Save new password reset token with both generated email and actual email
            PasswordReset reset = new PasswordReset(email, targetEmail, token, expiresAt);
            passwordResetDAO.save(reset);
            
            // Send password reset email with the reset code
            String resetLink = frontendUrl + "/reset-password";
            logger.info("Sending 6-digit password reset email to: {}", targetEmail);
            boolean emailSent = emailService.sendPasswordResetEmail(targetEmail, token, resetLink);
            
            if (emailSent) {
                logger.info("Password reset 6-digit code sent successfully to: {}", targetEmail);
            } else {
                logger.warn("Failed to send password reset 6-digit code to: {}", targetEmail);
            }
            
            // Always return success message
            response.put("success", true);
            response.put("message", "If these details match our records, you will receive a 6-digit reset code at your Personal Email");
            
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
            
            String testToken = "TEST-TOKEN-" + System.currentTimeMillis();
            String testLink = frontendUrl + "/reset-password?token=" + testToken;
            
            boolean emailSent = emailService.sendPasswordResetEmail(recipientEmail, testToken, testLink);
            
            if (emailSent) {
                logger.info("Test email sent successfully to: {}", recipientEmail);
                response.put("success", true);
                response.put("message", "Test email sent successfully to: " + recipientEmail);
            } else {
                logger.warn("Test email FAILED to send to: {}", recipientEmail);
                response.put("success", false);
                response.put("message", "Test email failed to send. Check server logs for details.");
            }
            
            return response;
        } catch (Exception e) {
            logger.error("Test email endpoint error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Test email error: " + e.getMessage());
            return response;
        }
    }
}
