package com.example.controller;

import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/member")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MemberProfileController {

    @GetMapping("/{memberId}")
    @JsonView(Views.Member.class)
    public Map<String, Object> getMemberProfile(@PathVariable int memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            MemberDAO memberDao = new MemberDAO();
            Member member = memberDao.getMemberById(memberId);
            
            if (member != null) {
                response.put("success", true);
                response.put("id", member.getId());
                response.put("firstName", member.getFirstName());
                response.put("lastName", member.getLastName());
                response.put("email", member.getEmail());
                response.put("phoneNumber", member.getPhoneNumber());
                response.put("profilePictureUrl", member.getProfilePictureUrl());
                response.put("bio", member.getBio());
                response.put("isProfilePublic", member.getIsProfilePublic());
                response.put("joinedDate", member.getJoinedDate());
            } else {
                response.put("success", false);
                response.put("message", "Member not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }

    @PutMapping("/{memberId}/profile")
    public Map<String, Object> updateMemberProfile(
            @PathVariable int memberId,
            @RequestBody Map<String, Object> updates) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            MemberDAO memberDao = new MemberDAO();
            Member member = memberDao.getMemberById(memberId);
            
            if (member != null) {
                // Update allowed fields
                if (updates.containsKey("phoneNumber")) {
                    member.setPhoneNumber((String) updates.get("phoneNumber"));
                }
                if (updates.containsKey("bio")) {
                    member.setBio((String) updates.get("bio"));
                }
                if (updates.containsKey("isProfilePublic")) {
                    member.setIsProfilePublic((Boolean) updates.get("isProfilePublic"));
                }
                
                if (memberDao.updateMember(member)) {
                    response.put("success", true);
                    response.put("message", "Profile updated successfully");
                    response.put("member", member);
                } else {
                    response.put("success", false);
                    response.put("message", "Failed to update profile");
                }
            } else {
                response.put("success", false);
                response.put("message", "Member not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }

    @PutMapping("/{memberId}/privacy")
    public Map<String, Object> updatePrivacySettings(
            @PathVariable int memberId,
            @RequestBody Map<String, Boolean> settings) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            MemberDAO memberDao = new MemberDAO();
            Member member = memberDao.getMemberById(memberId);
            
            if (member != null) {
                if (settings.containsKey("isProfilePublic")) {
                    member.setIsProfilePublic(settings.get("isProfilePublic"));
                    
                    if (memberDao.updateMember(member)) {
                        response.put("success", true);
                        response.put("message", "Privacy settings updated successfully");
                        response.put("isProfilePublic", member.getIsProfilePublic());
                    } else {
                        response.put("success", false);
                        response.put("message", "Failed to update privacy settings");
                    }
                } else {
                    response.put("success", false);
                    response.put("message", "Invalid request");
                }
            } else {
                response.put("success", false);
                response.put("message", "Member not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }

    @GetMapping("/public/{memberId}")
    @JsonView(Views.Public.class)
    public Map<String, Object> getPublicMemberProfile(@PathVariable int memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            MemberDAO memberDao = new MemberDAO();
            Member member = memberDao.getMemberById(memberId);
            
            if (member != null && member.getIsProfilePublic()) {
                response.put("success", true);
                response.put("id", member.getId());
                response.put("firstName", member.getFirstName());
                response.put("lastName", member.getLastName());
                response.put("profilePictureUrl", member.getProfilePictureUrl());
                response.put("bio", member.getBio());
                response.put("joinedDate", member.getJoinedDate());
            } else {
                response.put("success", false);
                response.put("message", "Member profile not found or is private");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }
}
