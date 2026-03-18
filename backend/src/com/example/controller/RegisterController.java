package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RegisterController {

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

            Member member = new Member(firstName, lastName, phoneNumber, email, password, gender);
            MemberDAO memberDao = new MemberDAO();
            
            try {
                if (memberDao.addMember(member)) {
                    // fetch the inserted member to obtain generated ID
                    Member saved = memberDao.getMemberByEmail(email);
                    response.put("success", true);
                    response.put("message", "Registration successful");
                    response.put("email", email);
                    if (saved != null) {
                        response.put("userId", saved.getId());
                        try {
                            com.example.dao.NotificationDAO notifDao = new com.example.dao.NotificationDAO();
                            String adminMsg = "A new member, " + firstName + " " + lastName + " (" + email + "), has just registered.";
                            notifDao.notifyAllAdmins("New Member Registration", adminMsg);
                        } catch (Exception notifEx) {
                            System.err.println("Failed to send admin notification for registration: " + notifEx.getMessage());
                        }
                    }
                } else {
                    // addMember returned false but no exception was thrown
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

