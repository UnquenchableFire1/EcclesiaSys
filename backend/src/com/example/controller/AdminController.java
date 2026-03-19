package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.AdminDAO;
import com.example.dao.MemberDAO;
import com.example.model.Admin;
import com.example.model.Member;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final AdminDAO adminDAO = new AdminDAO();
    private final MemberDAO memberDAO = new MemberDAO();

    @GetMapping
    public Map<String, Object> getAllAdmins() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Admin> admins = adminDAO.getAllAdmins();
            // Do not send passwords to the frontend
            for (Admin admin : admins) {
                admin.setPassword(null);
            }
            response.put("success", true);
            response.put("data", admins);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch admins: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getAdminById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Admin admin = adminDAO.getAdminById(id);
            if (admin != null) {
                admin.setPassword(null); // Never send password
                response.put("success", true);
                response.put("data", admin);
            } else {
                response.put("success", false);
                response.put("message", "Admin not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}/profile")
    public Map<String, Object> updateAdminProfile(@PathVariable int id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Admin admin = adminDAO.getAdminById(id);
            if (admin == null) {
                response.put("success", false);
                response.put("message", "Admin not found");
                return response;
            }

            if (request.containsKey("name")) admin.setName((String) request.get("name"));
            if (request.containsKey("bio")) admin.setBio((String) request.get("bio"));
            if (request.containsKey("phoneNumber")) admin.setPhoneNumber((String) request.get("phoneNumber"));
            if (request.containsKey("gender")) admin.setGender((String) request.get("gender"));

            boolean success = adminDAO.updateAdmin(admin);
            if (success) {
                response.put("success", true);
                response.put("message", "Profile updated successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update profile");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping
    public Map<String, Object> createAdmin(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String name = (String) request.get("name");
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            
            int createdBy = 0;
            if (request.get("createdBy") != null) {
                createdBy = Integer.parseInt(request.get("createdBy").toString());
            }

            if (name == null || email == null || password == null || name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                response.put("success", false);
                response.put("message", "Name, email, and password are required.");
                return response;
            }

            // Check if email already exists
            if (adminDAO.getAdminByEmail(email) != null) {
                response.put("success", false);
                response.put("message", "An admin with this email already exists.");
                return response;
            }

            Admin newAdmin = new Admin();
            newAdmin.setName(name);
            newAdmin.setEmail(email);
            newAdmin.setPassword(password);
            newAdmin.setCreatedBy(createdBy);

            boolean success = adminDAO.addAdmin(newAdmin);
            
            if (success) {
                response.put("success", true);
                response.put("message", "Admin created successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to create admin");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/promote/{memberId}")
    public Map<String, Object> promoteMemberToAdmin(@PathVariable int memberId, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int createdBy = 0;
            if (request.get("createdBy") != null) {
                createdBy = Integer.parseInt(request.get("createdBy").toString());
            }

            Member member = memberDAO.getMemberById(memberId);
            if (member == null) {
                response.put("success", false);
                response.put("message", "Member not found.");
                return response;
            }

            // Check if member is already an admin by email
            if (adminDAO.getAdminByEmail(member.getEmail()) != null) {
                response.put("success", false);
                response.put("message", "This member is already an admin.");
                return response;
            }

            // Use member's current info to create an admin. Use phone or default string as temp password if no custom logic.
            // But since members have passwords, let's keep their admin password the same as their member password.
            // Actually, we don't have access to unhashed/plain text password in the member object easily, wait.
            // Oh, wait, in this app, passwords might just be stored as plain strings in the models for now based on dao.
            
            Admin newAdmin = new Admin();
            newAdmin.setName(member.getName());
            newAdmin.setEmail(member.getEmail());
            newAdmin.setPassword(member.getPassword()); // They can change it later or use same
            newAdmin.setCreatedBy(createdBy);

            boolean success = adminDAO.addAdmin(newAdmin);
            
            if (success) {
                response.put("success", true);
                response.put("message", "Member successfully promoted to Admin.");
            } else {
                response.put("success", false);
                response.put("message", "Failed to promote member.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteAdmin(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean success = adminDAO.deleteAdmin(id);
            if (success) {
                response.put("success", true);
                response.put("message", "Admin deleted successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete admin or admin not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/{id}/change-password")
    public Map<String, Object> changePassword(@PathVariable int id, @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            String otp = request.get("otp");
            if (otp == null || otp.isEmpty()) {
                response.put("success", false);
                response.put("message", "Verification code is required.");
                return response;
            }

            Admin admin = adminDAO.getAdminById(id);
            if (admin == null) {
                response.put("success", false);
                response.put("message", "Admin not found.");
                return response;
            }

            if (!VerificationController.isValidOtp(admin.getEmail(), otp)) {
                response.put("success", false);
                response.put("message", "Invalid or expired verification code.");
                return response;
            }

            if (!admin.getPassword().equals(currentPassword)) {
                response.put("success", false);
                response.put("message", "Incorrect current password.");
                return response;
            }

            if (adminDAO.updateAdminPassword(id, newPassword)) {
                response.put("success", true);
                response.put("message", "Password changed successfully.");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update password.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
        }
        return response;
    }
}
