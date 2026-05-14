package com.example.service;

import com.example.dao.AdminDAO;
import com.example.dao.AuditLogDAO;
import com.example.model.Admin;
import com.example.model.AuditLog;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class AuditService {

    private final AuditLogDAO auditLogDAO = new AuditLogDAO();
    private final AdminDAO adminDAO = new AdminDAO();

    public void log(HttpServletRequest request, String action, String targetType, String targetId, String details) {
        try {
            Integer userId = (Integer) request.getAttribute("userId");
            String userType = (String) request.getAttribute("userType");

            if (userId != null && "admin".equalsIgnoreCase(userType)) {
                Admin admin = adminDAO.getAdminById(userId);
                String adminName = (admin != null) ? admin.getName() : "Unknown Admin";

                AuditLog log = new AuditLog(userId, adminName, action, targetType, targetId, details);
                auditLogDAO.logAction(log);
            }
        } catch (Exception e) {
            System.err.println("Audit logging failed: " + e.getMessage());
        }
    }
}
