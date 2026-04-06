package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.service.EmailTemplateService;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RegisterController {
    
    @Autowired
    private EmailTemplateService emailTemplateService;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");
            String phoneNumber = request.get("phoneNumber");
            String email = request.get("email");
            String password = request.get("password");
            String confirmPassword = request.get("confirmPassword");
            String gender = request.getOrDefault("gender", "Not Specified");
            String branchIdStr = request.get("branchId");
            Integer branchId = (branchIdStr != null && !branchIdStr.isEmpty()) ? Integer.parseInt(branchIdStr) : null;
            
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                phoneNumber == null || phoneNumber.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "All fields are required");
                return response;
            }

            if (!password.equals(confirmPassword)) {
                response.put("success", false);
                response.put("message", "Passwords do not match");
                return response;
            }

            // Hash the password explicitly
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

            Member member = new Member(firstName, lastName, phoneNumber, email, hashedPassword, gender);
            member.setBranchId(branchId);
            MemberDAO memberDao = new MemberDAO();
            
            try {
                if (memberDao.addMember(member)) {
                    try {
                        // Verification is now removed, send a welcome email instead
                        emailTemplateService.sendWelcomeEmail(email, firstName + " " + lastName, "COP Ayikai Doblo");
                        
                        com.example.dao.NotificationDAO notifDao = new com.example.dao.NotificationDAO();
                        String adminMsg = "A new member, " + firstName + " " + lastName + " (" + email + "), has just registered and joined the assembly.";
                        notifDao.notifyAllAdmins("New Member Integration", adminMsg);
                    } catch (Exception notifEx) {
                        System.err.println("Failed to send welcome email or admin notification: " + notifEx.getMessage());
                    }
                    
                    response.put("success", true);
                    response.put("message", "Registration successful! Welcome to the assembly.");
                    response.put("email", email);
                    response.put("isVerified", true);
                } else {
                    response.put("success", false);
                    response.put("message", "Registration failed - database insert returned 0 rows. This may indicate a duplicate email or database constraint violation.");
                    System.err.println("ERROR: addMember returned false for email: " + email + " but no SQL exception was thrown");
                }
            } catch (RuntimeException rte) {
                // This would be from the SQL error thrown by MemberDAO
                response.put("success", false);
                response.put("message", rte.getMessage());
                System.err.println("RuntimeException during registration: " + rte.getMessage());
                rte.printStackTrace();
            }
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            response.put("success", false);
            response.put("message", "Server error: " + errorMsg);
            System.err.println("Registration exception: " + errorMsg);
            e.printStackTrace();
        }
        
        return response;
    }

}

