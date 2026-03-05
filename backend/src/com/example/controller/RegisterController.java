package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

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
            String password = request.get("password");
            String confirmPassword = request.get("confirmPassword");
            
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                phoneNumber == null || phoneNumber.trim().isEmpty() ||
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

            // Generate auto email
            String name = firstName + " " + lastName;
            String email = generateAutoEmail(name);

            Member member = new Member(firstName, lastName, phoneNumber, email, password);
            MemberDAO memberDao = new MemberDAO();
            
            if (memberDao.addMember(member)) {
                // fetch the inserted member to obtain generated ID
                Member saved = memberDao.getMemberByEmail(email);
                response.put("success", true);
                response.put("message", "Registration successful");
                response.put("email", email);
                if (saved != null) {
                    response.put("userId", saved.getId());
                }
            } else {
                response.put("success", false);
                response.put("message", "Registration failed");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }

    private String generateAutoEmail(String name) {
        String firstName = name.split(" ")[0].toLowerCase();
        MemberDAO memberDao = new MemberDAO();
        
        // Check if first name is Benjamin or if first name already exists in database
        int existingCount = memberDao.countMembersWithFirstName(firstName);
        
        if ("benjamin".equals(firstName) || existingCount > 0) {
            // Index from 0 upward for Benjamin or duplicate first names
            return firstName + existingCount + "@bbj.com";
        } else {
            // For unique first names, use full name with dot separator
            String sanitized = name.toLowerCase().replaceAll("\\s+", ".");
            return sanitized + "@bbj.com";
        }
    }

    private String generatePassword() {
        Random rand = new Random();
        return "pass" + rand.nextInt(10000);
    }
}
