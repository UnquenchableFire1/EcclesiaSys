package com.example.controller;

import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.web.bind.annotation.*;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import org.mindrot.jbcrypt.BCrypt;
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
                response.put("member", member);
                
                // Keep backward compatibility for specific fields if needed
                response.put("id", member.getId());
                response.put("firstName", member.getFirstName());
                response.put("lastName", member.getLastName());
                response.put("email", member.getEmail());
                response.put("phoneNumber", member.getPhoneNumber());
                String profilePictureUrl = member.getProfilePictureUrl();
                if (profilePictureUrl == null || profilePictureUrl.isEmpty()) {
                    profilePictureUrl = "https://ui-avatars.com/api/?name=" + 
                                       member.getFirstName() + "+" + member.getLastName() + 
                                       "&background=random&color=fff&size=256";
                }
                response.put("profilePictureUrl", profilePictureUrl);
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
                if (updates.containsKey("gender")) member.setGender((String) updates.get("gender"));
                if (updates.containsKey("phoneNumber")) member.setPhoneNumber((String) updates.get("phoneNumber"));
                if (updates.containsKey("bio")) member.setBio((String) updates.get("bio"));
                if (updates.containsKey("isProfilePublic")) member.setIsProfilePublic((Boolean) updates.get("isProfilePublic"));
                
                // Personal Details
                if (updates.containsKey("title")) member.setTitle((String) updates.get("title"));
                if (updates.containsKey("dateOfBirth")) member.setDateOfBirth((String) updates.get("dateOfBirth"));
                if (updates.containsKey("placeOfBirth")) member.setPlaceOfBirth((String) updates.get("placeOfBirth"));
                if (updates.containsKey("membershipType")) member.setMembershipType((String) updates.get("membershipType"));
                if (updates.containsKey("maritalStatus")) member.setMaritalStatus((String) updates.get("maritalStatus"));
                if (updates.containsKey("addressLine1")) member.setAddressLine1((String) updates.get("addressLine1"));
                if (updates.containsKey("gpsAddress")) member.setGpsAddress((String) updates.get("gpsAddress"));
                if (updates.containsKey("hometown")) member.setHometown((String) updates.get("hometown"));
                if (updates.containsKey("streetName")) member.setStreetName((String) updates.get("streetName"));
                if (updates.containsKey("city")) member.setCity((String) updates.get("city"));
                if (updates.containsKey("postalCode")) member.setPostalCode((String) updates.get("postalCode"));
                if (updates.containsKey("nationality")) member.setNationality((String) updates.get("nationality"));
                if (updates.containsKey("countryOfBirth")) member.setCountryOfBirth((String) updates.get("countryOfBirth"));
                if (updates.containsKey("familyMemberName")) member.setFamilyMemberName((String) updates.get("familyMemberName"));
                if (updates.containsKey("relationship")) member.setRelationship((String) updates.get("relationship"));
                if (updates.containsKey("residentialAddress")) member.setResidentialAddress((String) updates.get("residentialAddress"));
                if (updates.containsKey("locality")) member.setLocality((String) updates.get("locality"));
                if (updates.containsKey("landmark")) member.setLandmark((String) updates.get("landmark"));

                // Church Details
                if (updates.containsKey("holyGhostBaptism")) member.setHolyGhostBaptism((String) updates.get("holyGhostBaptism"));
                if (updates.containsKey("dateOfHolySpiritBaptism")) member.setDateOfHolySpiritBaptism((String) updates.get("dateOfHolySpiritBaptism"));
                if (updates.containsKey("waterBaptism")) member.setWaterBaptism((String) updates.get("waterBaptism"));
                if (updates.containsKey("dateOfWaterBaptism")) member.setDateOfWaterBaptism((String) updates.get("dateOfWaterBaptism"));
                if (updates.containsKey("dateOfConversion")) member.setDateOfConversion((String) updates.get("dateOfConversion"));
                if (updates.containsKey("formerChurch")) member.setFormerChurch((String) updates.get("formerChurch"));
                if (updates.containsKey("dateOfJoining")) member.setDateOfJoining((String) updates.get("dateOfJoining"));
                if (updates.containsKey("placeOfBaptism")) member.setPlaceOfBaptism((String) updates.get("placeOfBaptism"));
                if (updates.containsKey("officiatingMinisterAtBaptism")) member.setOfficiatingMinisterAtBaptism((String) updates.get("officiatingMinisterAtBaptism"));
                if (updates.containsKey("officiatingMinisterDistrict")) member.setOfficiatingMinisterDistrict((String) updates.get("officiatingMinisterDistrict"));
                if (updates.containsKey("communicant")) member.setCommunicant((String) updates.get("communicant"));
                if (updates.containsKey("positionInChurch")) member.setPositionInChurch((String) updates.get("positionInChurch"));
                if (updates.containsKey("otherAppointments")) member.setOtherAppointments((String) updates.get("otherAppointments"));
                if (updates.containsKey("ministry")) member.setMinistry((String) updates.get("ministry"));
                if (updates.containsKey("zone")) member.setZone((String) updates.get("zone"));
                if (updates.containsKey("occupation")) member.setOccupation((String) updates.get("occupation"));
                if (updates.containsKey("humStatus")) member.setHumStatus((String) updates.get("hum_status")); // Map hum_status to humStatus
                if (updates.containsKey("hum_status")) member.setHumStatus((String) updates.get("hum_status"));
                if (updates.containsKey("levelOfEducation")) member.setLevelOfEducation((String) updates.get("levelOfEducation"));
                if (updates.containsKey("schoolName")) member.setSchoolName((String) updates.get("schoolName"));
                if (updates.containsKey("schoolLocation")) member.setSchoolLocation((String) updates.get("schoolLocation"));
                if (updates.containsKey("isEntrepreneur")) member.setIsEntrepreneur((String) updates.get("isEntrepreneur"));
                if (updates.containsKey("isRetired")) member.setIsRetired((String) updates.get("isRetired"));
                if (updates.containsKey("dateOfRetirement")) member.setDateOfRetirement((String) updates.get("dateOfRetirement"));
                if (updates.containsKey("hasDisability")) member.setHasDisability((String) updates.get("hasDisability"));
                if (updates.containsKey("natureOfDisability")) member.setNatureOfDisability((String) updates.get("natureOfDisability"));
                if (updates.containsKey("assistiveDevice")) member.setAssistiveDevice((String) updates.get("assistiveDevice"));
                if (updates.containsKey("royalStatus")) member.setRoyalStatus((String) updates.get("royalStatus"));
                if (updates.containsKey("traditionalArea")) member.setTraditionalArea((String) updates.get("traditionalArea"));
                if (updates.containsKey("yearAppointed")) member.setYearAppointed((String) updates.get("yearAppointed"));
                if (updates.containsKey("parentGuardianName")) member.setParentGuardianName((String) updates.get("parentGuardianName"));
                if (updates.containsKey("parentGuardianContact")) member.setParentGuardianContact((String) updates.get("parentGuardianContact"));
                if (updates.containsKey("isDedicated")) member.setIsDedicated((String) updates.get("isDedicated"));
                if (updates.containsKey("dedicationDate")) member.setDedicationDate((String) updates.get("dedicationDate"));
                if (updates.containsKey("officiatingMinisterAtDedication")) member.setOfficiatingMinisterAtDedication((String) updates.get("officiatingMinisterAtDedication"));
                if (updates.containsKey("dedicationChurch")) member.setDedicationChurch((String) updates.get("dedicationChurch"));
                
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
            
            if (member != null) {
                String profilePictureUrl = member.getProfilePictureUrl();
                if (profilePictureUrl == null || profilePictureUrl.isEmpty()) {
                    profilePictureUrl = "https://ui-avatars.com/api/?name=" + 
                                       member.getFirstName() + "+" + member.getLastName() + 
                                       "&background=random&color=fff&size=256";
                }
                
                response.put("success", true);
                response.put("id", member.getId());
                response.put("firstName", member.getFirstName());
                response.put("lastName", member.getLastName());
                response.put("profilePictureUrl", profilePictureUrl);
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

            if (currentPassword == null || newPassword == null || currentPassword.isEmpty() || newPassword.isEmpty()) {
                response.put("success", false);
                response.put("message", "Current and new passwords are required.");
                return response;
            }

            MemberDAO memberDao = new MemberDAO();
            Member member = memberDao.getMemberById(id);
            if (member == null) {
                response.put("success", false);
                response.put("message", "Member not found.");
                return response;
            }

            if (!VerificationController.isValidOtp(member.getEmail(), otp)) {
                response.put("success", false);
                response.put("message", "Invalid or expired verification code.");
                return response;
            }

            // Secure comparison using BCrypt
            if (!BCrypt.checkpw(currentPassword, member.getPassword())) {
                response.put("success", false);
                response.put("message", "Incorrect current password.");
                return response;
            }

            String hashedNewPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
            if (memberDao.updateMemberPassword(id, hashedNewPassword)) {
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
