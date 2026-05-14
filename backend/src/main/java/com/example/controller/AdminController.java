package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.AdminDAO;
import com.example.model.Admin;
import org.mindrot.jbcrypt.BCrypt;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final AdminDAO adminDAO = new AdminDAO();
    
    @Autowired
    private AuditService auditService;

    @GetMapping
    public Map<String, Object> getAllAdmins(@RequestParam(required = false) Integer branchId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Admin> admins;
            if (branchId != null) {
                admins = adminDAO.getAdminsByBranch(branchId);
            } else {
                admins = adminDAO.getAllAdmins();
            }
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
    public Map<String, Object> createAdmin(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String name     = (String) request.get("name");
            String email    = (String) request.get("email");
            String password = (String) request.get("password");

            int requesterId = 0;
            if (request.get("createdBy") != null) {
                requesterId = Integer.parseInt(request.get("createdBy").toString());
            }

            Admin requester = adminDAO.getAdminById(requesterId);
            if (requester == null) {
                response.put("success", false);
                response.put("message", "Requester not found.");
                return response;
            }

            boolean isSuperAdmin = adminDAO.isSuperAdmin(requesterId);
            boolean isBranchAdmin = "BRANCH_ADMIN".equals(requester.getRole());

            // Only SUPER_ADMIN and BRANCH_ADMIN can create accounts
            if (!isSuperAdmin && !isBranchAdmin) {
                response.put("success", false);
                response.put("message", "You do not have permission to create staff accounts.");
                return response;
            }

            // Determine requested role — default to BRANCH_ADMIN
            String requestedRole = (String) request.getOrDefault("role", "BRANCH_ADMIN");

            // Prevent assigning SUPER_ADMIN via API
            if ("SUPER_ADMIN".equals(requestedRole)) {
                response.put("success", false);
                response.put("message", "Super Admin accounts cannot be created via this endpoint.");
                return response;
            }

            // Branch admins can only create their own branch staff
            if (isBranchAdmin && !isSuperAdmin) {
                if (!"BRANCH_SECRETARY".equals(requestedRole) && !"BRANCH_MEDIA".equals(requestedRole)) {
                    response.put("success", false);
                    response.put("message", "Branch Admins can only create Branch Secretary and Media Team accounts.");
                    return response;
                }
            }

            if (name == null || email == null || password == null ||
                name.isEmpty() || email.isEmpty() || password.isEmpty()) {
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
            newAdmin.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
            newAdmin.setCreatedBy(requesterId);
            newAdmin.setRole(requestedRole);

            // Assign branch: use request branchId OR fall back to requester's branch
            if (request.containsKey("branchId") && request.get("branchId") != null
                    && !request.get("branchId").toString().isBlank()) {
                Object bIdObj = request.get("branchId");
                if (bIdObj instanceof Number) {
                    newAdmin.setBranchId(((Number) bIdObj).intValue());
                } else {
                    try { newAdmin.setBranchId(Integer.parseInt(bIdObj.toString())); } catch (NumberFormatException ignored) {}
                }
            } else if (isBranchAdmin && requester.getBranchId() != null) {
                // Branch admin creating media team: auto-assign their own branch
                newAdmin.setBranchId(requester.getBranchId());
            }

            boolean success = adminDAO.addAdmin(newAdmin);
            if (success) {
                auditService.log(httpRequest, "CREATE_ADMIN", "ADMIN", email, "Created staff account for: " + name + " (" + requestedRole + ")");
                response.put("success", true);
                response.put("message", "Staff account created successfully.");
            } else {
                response.put("success", false);
                response.put("message", "Failed to create admin account.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/promote/{memberId}")
    public Map<String, Object> promoteMemberToAdmin(@PathVariable int memberId, @RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            int requesterId = 0;
            if (request.get("createdBy") != null) {
                requesterId = Integer.parseInt(request.get("createdBy").toString());
            }

            if (!adminDAO.isSuperAdmin(requesterId)) {
                response.put("success", false);
                response.put("message", "Only the primary administrator can promote members to admin.");
                return response;
            }

            Integer branchId = null;
            if (request.containsKey("branchId")) {
                Object bIdObj = request.get("branchId");
                if (bIdObj instanceof Number) branchId = ((Number) bIdObj).intValue();
            }

            if (adminDAO.promoteMemberToAdmin(memberId, requesterId, branchId)) {
                auditService.log(httpRequest, "PROMOTE_MEMBER", "MEMBER", String.valueOf(memberId), "Promoted member to Admin role");
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
    public Map<String, Object> deleteAdmin(@PathVariable int id, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean success = adminDAO.deleteAdmin(id);
            if (success) {
                auditService.log(httpRequest, "DELETE_ADMIN", "ADMIN", String.valueOf(id), "Deleted staff account ID: " + id);
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

            // Secure comparison using BCrypt
            if (!BCrypt.checkpw(currentPassword, admin.getPassword())) {
                response.put("success", false);
                response.put("message", "Incorrect current password.");
                return response;
            }

            String hashedNewPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
            if (adminDAO.updateAdminPassword(id, hashedNewPassword)) {
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
