package com.example.controller;

import com.example.dao.AdminDAO;
import com.example.dao.AuditLogDAO;
import com.example.model.AuditLog;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuditLogController {

    private final AuditLogDAO auditLogDAO = new AuditLogDAO();
    private final AdminDAO adminDAO = new AdminDAO();

    @GetMapping
    public Map<String, Object> getAuditLogs(@RequestParam int adminId, @RequestParam(defaultValue = "100") int limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Permission Check: Only Super Admins can view audit logs
            if (!adminDAO.isSuperAdmin(adminId)) {
                response.put("success", false);
                response.put("message", "Access denied. Only the primary administrator can view system logs.");
                return response;
            }

            List<AuditLog> logs = auditLogDAO.getAllLogs(limit);
            response.put("success", true);
            response.put("data", logs);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch audit logs: " + e.getMessage());
        }
        return response;
    }
}
