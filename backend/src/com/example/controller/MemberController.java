package com.example.controller;

import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MemberController {

    @GetMapping
    @JsonView(Views.Admin.class)
    public Map<String, Object> getAllMembers() {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            List<Member> members = dao.getAllMembers();
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
    public Map<String, Object> deleteMember(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            if (dao.deleteMember(id)) {
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
    @JsonView(Views.Public.class)
    public Map<String, Object> getPublicMembers() {
        Map<String, Object> response = new HashMap<>();
        try {
            MemberDAO dao = new MemberDAO();
            List<Member> members = dao.getPublicMembers();
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
}
