package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.google.gson.JsonObject;
import com.example.dao.MemberDAO;
import com.example.dao.AdminDAO;
import com.example.model.Member;
import com.example.model.Admin;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LoginController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");

            // Check against admin credentials
            if ("benjamin@ecclesiasys.com".equals(email) && "fire@123".equals(password)) {
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("userId", 1);
                response.put("userType", "admin");
                response.put("name", "Benjamin");
            } else {
                // Check against member database
                MemberDAO memberDao = new MemberDAO();
                if (memberDao.verifyMemberLogin(email, password)) {
                    Member member = memberDao.getMemberByEmail(email);
                    response.put("success", true);
                    response.put("message", "Login successful");
                    response.put("userId", member.getId());
                    response.put("userType", "member");
                    response.put("name", member.getName());
                } else {
                    response.put("success", false);
                    response.put("message", "Invalid email or password");
                }
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }
}
