package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.dao.AdminDAO;
import com.example.dao.PasswordResetDAO;
import com.example.model.Member;
import com.example.model.Admin;
import com.example.security.JwtUtil;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final PasswordResetDAO passwordResetDAO = new PasswordResetDAO();

    @Autowired
    private JwtUtil jwtUtil;

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

            AdminDAO adminDao = new AdminDAO();
            // Check against admin database (includes super admin)
            if (adminDao.verifyAdminLogin(email, password)) {
                Admin admin = adminDao.getAdminByEmail(email);
                
                String role = admin.getRole() != null ? admin.getRole() : "BRANCH_ADMIN";
                String token = jwtUtil.generateToken(admin.getEmail(), admin.getId(), "admin", admin.getBranchId(), role);
                
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("userId", admin.getId());
                response.put("userType", "admin");
                response.put("name", admin.getName());
                response.put("email", admin.getEmail());
                response.put("branchId", admin.getBranchId());
                response.put("role", role);
            } else {
                // Check against member database
                MemberDAO memberDao = new MemberDAO();
                if (memberDao.verifyMemberLogin(email, password)) {
                    Member member = memberDao.getMemberByEmail(email);
                    
                    if (!member.getIsVerified()) {
                        response.put("success", false);
                        response.put("requireVerification", true);
                        response.put("email", email);
                        response.put("message", "Your email is not verified. Please verify your email to continue.");
                        return response;
                    }
                    
                    String token = jwtUtil.generateToken(member.getEmail(), member.getId(), "member", member.getBranchId(), "MEMBER");
                    
                    response.put("success", true);
                    response.put("message", "Login successful");
                    response.put("token", token);
                    response.put("userId", member.getId());
                    response.put("userType", "member");
                    response.put("name", member.getName());
                    response.put("email", member.getEmail());
                    response.put("branchId", member.getBranchId());
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
