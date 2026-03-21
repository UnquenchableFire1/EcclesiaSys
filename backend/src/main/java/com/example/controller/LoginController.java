package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.dao.AdminDAO;
import com.example.dao.PasswordResetDAO;
import com.example.model.Member;
import com.example.model.Admin;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LoginController {

    private final PasswordResetDAO passwordResetDAO = new PasswordResetDAO();

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");

            // Check if a password reset is in progress for this member
            if (passwordResetDAO.hasActiveToken(email)) {
                response.put("success", false);
                response.put("message", "A password reset is in progress for this account. Please use the reset code sent to your email to complete the reset or wait for it to expire.");
                return response;
            }

            // Check against hardcoded super admin credentials
            if ("benjaminbuckmanjunior@gmail.com".equals(email) && "fire@123".equals(password)) {
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("userId", 1);
                response.put("userType", "admin");
                response.put("name", "Benjamin");
                response.put("email", "benjaminbuckmanjunior@gmail.com");
            } else {
                AdminDAO adminDao = new AdminDAO();
                // Check against admin database
                if (adminDao.verifyAdminLogin(email, password)) {
                    Admin admin = adminDao.getAdminByEmail(email);
                    response.put("success", true);
                    response.put("message", "Login successful");
                    response.put("userId", admin.getId());
                    response.put("userType", "admin");
                    response.put("name", admin.getName());
                    response.put("email", admin.getEmail());
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
                        response.put("email", member.getEmail());
                    } else {
                        response.put("success", false);
                        response.put("message", "Invalid email or password");
                    }
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
