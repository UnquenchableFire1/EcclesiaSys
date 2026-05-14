package com.example.controller;

import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MemberController {

    @Autowired
    private AuditService auditService;

    @GetMapping
    public Map<String, Object> getAllMembers(@RequestParam(required = false) Integer branchId) {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            List<Member> members = dao.getAllMembers(branchId);
            response.put("success", true);
            response.put("data", members);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/{id}")
    @JsonView(Views.Admin.class)
    public Map<String, Object> getMemberById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            Member member = dao.getMemberById(id);
            if (member != null) {
                response.put("success", true);
                response.put("data", member);
            } else {
                response.put("success", false);
                response.put("message", "Member not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteMember(@PathVariable int id, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            Member member = dao.getMemberById(id);
            String memberName = (member != null) ? member.getFirstName() + " " + member.getLastName() : "Unknown";

            if (dao.deleteMember(id)) {
                auditService.log(request, "DELETE_MEMBER", "MEMBER", String.valueOf(id), "Deleted member: " + memberName);
                response.put("success", true);
                response.put("message", "Member deleted");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete member");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/public")
    public Map<String, Object> getPublicMembers(@RequestParam(required = false) Integer branchId) {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            List<Member> members = dao.getPublicMembers(branchId);
            response.put("success", true);
            response.put("data", members);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/migrate-emails")
    public Map<String, Object> migrateEmails() {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            dao.migrateEmails();
            response.put("success", true);
            response.put("message", "Email migration completed successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Migration failed: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}/toggle-status")
    public Map<String, Object> toggleMemberStatus(@PathVariable int id, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            Member member = dao.getMemberById(id);
            String newStatus = (member != null && "active".equals(member.getStatus())) ? "disabled" : "active";

            if (dao.toggleMemberStatus(id)) {
                auditService.log(request, "TOGGLE_STATUS", "MEMBER", String.valueOf(id), "Changed status to: " + newStatus);
                response.put("success", true);
                response.put("message", "Member status toggled");
            } else {
                response.put("success", false);
                response.put("message", "Failed to toggle status");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}/assign-branch")
    public Map<String, Object> assignBranch(@PathVariable int id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer branchId = null;
            if (request.containsKey("branchId") && request.get("branchId") != null) {
                branchId = ((Number) request.get("branchId")).intValue();
            }
            MemberDAO dao = new MemberDAO();
            if (dao.assignBranch(id, branchId)) {
                response.put("success", true);
                response.put("message", "Member branch assigned successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to assign branch");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
