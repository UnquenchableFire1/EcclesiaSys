package com.example.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.dao.SermonDAO;
import com.example.dao.MemberDAO;
import com.example.model.Sermon;
import com.example.model.Member;
import com.example.service.CloudinaryFileUploadService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    @PostMapping("/sermon")
    public Map<String, Object> uploadSermon(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false, defaultValue = "") String title,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam(value = "adminId", required = false, defaultValue = "0") int adminId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("=== Sermon Upload Request ===");
            System.out.println("File: " + file.getOriginalFilename());
            System.out.println("Size: " + file.getSize() + " bytes");
            
            // Validate file type
            String fileName = file.getOriginalFilename();
            if (!fileName.endsWith(".mp3") && !fileName.endsWith(".mp4")) {
                response.put("success", false);
                response.put("message", "Only MP3 and MP4 files are allowed");
                return response;
            }

            // Validate file size (500MB max)
            long maxSize = 524288000; // 500MB
            if (file.getSize() > maxSize) {
                response.put("success", false);
                response.put("message", "File size exceeds 500MB limit");
                return response;
            }

            // Create temporary file
            File tempFile = File.createTempFile("sermon_", fileName);
            Files.write(tempFile.toPath(), file.getBytes());

            // Upload to Cloudinary
            String fileUrl = null;
            try {
                System.out.println("Uploading to Cloudinary...");
                fileUrl = CloudinaryFileUploadService.uploadFile(tempFile);
                System.out.println("Cloudinary upload successful: " + fileUrl);
            } catch (Exception uploadError) {
                System.err.println("Cloudinary upload failed: " + uploadError.getMessage());
                uploadError.printStackTrace();
                response.put("success", false);
                response.put("message", "File upload to storage failed: " + uploadError.getMessage());
                return response;
            }

            // Extract file type
            String fileType = fileName.endsWith(".mp4") ? "mp4" : "mp3";

            response.put("success", true);
            response.put("message", "Sermon file uploaded successfully");
            response.put("fileUrl", fileUrl);

            // Clean up temp file
            tempFile.delete();

        } catch (IOException e) {
            System.err.println("IO Error during sermon upload: " + e.getMessage());
            response.put("success", false);
            response.put("message", "File read error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error during sermon upload: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    // Compatibility endpoint expected by frontend: POST /api/sermons/upload
    @PostMapping("/sermons/upload")
    public Map<String, Object> uploadSermonCompat(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "adminId", required = false, defaultValue = "0") int adminId) {
        return uploadSermon(file, title != null ? title : "", description != null ? description : "", adminId);
    }

    @PostMapping("/profile-picture")
    public Map<String, Object> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "memberId", required = false) Integer memberId,
            @RequestParam(value = "userType", defaultValue = "member") String userType) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Handle backward compatibility for memberId
        int finalUserId = (userId != null) ? userId : (memberId != null ? memberId : 0);
        
        if (finalUserId == 0) {
            response.put("success", false);
            response.put("message", "User ID is required");
            return response;
        }
        
        try {
            // Validate file type
            String fileName = file.getOriginalFilename();
            if (fileName == null || !fileName.toLowerCase().matches(".*\\.(jpg|jpeg|png|gif)$")) {
                response.put("success", false);
                response.put("message", "Only JPG, PNG, and GIF files are allowed");
                return response;
            }

            // Validate file size (10MB max for profile pics)
            long maxSize = 10485760; // 10MB
            if (file.getSize() > maxSize) {
                response.put("success", false);
                response.put("message", "File size exceeds 10MB limit");
                return response;
            }

            // Create temporary file
            File tempFile = File.createTempFile("profile_", fileName);
            Files.write(tempFile.toPath(), file.getBytes());

            // Upload to Cloudinary
            String fileUrl = null;
            try {
                System.out.println("Uploading profile picture to Cloudinary...");
                fileUrl = CloudinaryFileUploadService.uploadFile(tempFile);
            } catch (Exception uploadError) {
                System.err.println("Cloudinary upload failed: " + uploadError.getMessage());
                uploadError.printStackTrace();
                response.put("success", false);
                response.put("message", "File upload to storage failed: " + uploadError.getMessage());
                return response;
            }

            // Update user profile picture in database
            boolean updateSuccess = false;
            if ("admin".equalsIgnoreCase(userType)) {
                com.example.dao.AdminDAO adminDao = new com.example.dao.AdminDAO();
                com.example.model.Admin admin = adminDao.getAdminById(finalUserId);
                if (admin != null) {
                    admin.setProfilePictureUrl(fileUrl);
                    updateSuccess = adminDao.updateAdmin(admin);
                }
            } else {
                MemberDAO memberDao = new MemberDAO();
                Member member = memberDao.getMemberById(finalUserId);
                if (member != null) {
                    member.setProfilePictureUrl(fileUrl);
                    updateSuccess = memberDao.updateMember(member);
                }
            }

            if (updateSuccess) {
                // Save to history
                com.example.dao.UserProfilePictureDAO historyDao = new com.example.dao.UserProfilePictureDAO();
                historyDao.addProfilePicture(finalUserId, userType, fileUrl);
                
                response.put("success", true);
                response.put("message", "Profile picture uploaded successfully");
                response.put("profilePictureUrl", fileUrl);
            } else {
                response.put("success", false);
                response.put("message", "Failed to save profile picture to database");
            }

            // Clean up temp file
            tempFile.delete();

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "File upload error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    @GetMapping("/profile-picture/history")
    public Map<String, Object> getProfilePictureHistory(
            @RequestParam("userId") int userId,
            @RequestParam(value = "userType", defaultValue = "member") String userType) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            com.example.dao.UserProfilePictureDAO historyDao = new com.example.dao.UserProfilePictureDAO();
            java.util.List<String> history = historyDao.getProfilePictureHistory(userId, userType);
            response.put("success", true);
            response.put("history", history);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching history: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/profile-picture/select")
    public Map<String, Object> selectProfilePicture(
            @RequestParam("userId") int userId,
            @RequestParam(value = "userType", defaultValue = "member") String userType,
            @RequestParam("url") String url) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            boolean updateSuccess = false;
            if ("admin".equalsIgnoreCase(userType)) {
                com.example.dao.AdminDAO adminDao = new com.example.dao.AdminDAO();
                com.example.model.Admin admin = adminDao.getAdminById(userId);
                if (admin != null) {
                    admin.setProfilePictureUrl(url);
                    updateSuccess = adminDao.updateAdmin(admin);
                }
            } else {
                MemberDAO memberDao = new MemberDAO();
                Member member = memberDao.getMemberById(userId);
                if (member != null) {
                    member.setProfilePictureUrl(url);
                    updateSuccess = memberDao.updateMember(member);
                }
            }

            if (updateSuccess) {
                response.put("success", true);
                response.put("message", "Profile picture updated successfully");
                response.put("profilePictureUrl", url);
            } else {
                response.put("success", false);
                response.put("message", "User not found or update failed");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/event-document")
    public Map<String, Object> uploadEventDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "eventId", required = false) Integer eventId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file type (PDF, DOCX, TXT, XLSX, etc.)
            String fileName = file.getOriginalFilename();
            if (!fileName.toLowerCase().matches(".*\\.(pdf|doc|docx|txt|xlsx|xls|ppt|pptx)$")) {
                response.put("success", false);
                response.put("message", "Only PDF, DOCX, TXT, XLSX, PPTX and similar files are allowed");
                return response;
            }

            // Validate file size (50MB max for documents)
            long maxSize = 52428800; // 50MB
            if (file.getSize() > maxSize) {
                response.put("success", false);
                response.put("message", "File size exceeds 50MB limit");
                return response;
            }

            // Create temporary file
            File tempFile = File.createTempFile("event_doc_", fileName);
            Files.write(tempFile.toPath(), file.getBytes());

            // Upload to Cloudinary
            String fileUrl = null;
            try {
                System.out.println("Uploading document to Cloudinary...");
                fileUrl = CloudinaryFileUploadService.uploadFile(tempFile);
                response.put("success", true);
                response.put("message", "Document uploaded successfully");
                response.put("fileUrl", fileUrl);
            } catch (Exception uploadError) {
                System.err.println("Cloudinary upload failed: " + uploadError.getMessage());
                uploadError.printStackTrace();
                response.put("success", false);
                response.put("message", "File upload to storage failed: " + uploadError.getMessage());
                return response;
            }

            // Clean up temp file
            tempFile.delete();

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "File upload error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    @PostMapping("/announcement")
    public Map<String, Object> uploadAnnouncementFile(
            @RequestParam("file") MultipartFile file) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("=== Announcement File Upload Request ===");
            System.out.println("File: " + file.getOriginalFilename());
            System.out.println("Size: " + file.getSize() + " bytes");
            
            // Validate file exists
            String fileName = file.getOriginalFilename();
            if (fileName == null || fileName.isEmpty()) {
                response.put("success", false);
                response.put("message", "File name is required");
                return response;
            }

            // Validate file size (100MB max for announcements)
            long maxSize = 104857600; // 100MB
            if (file.getSize() > maxSize) {
                response.put("success", false);
                response.put("message", "File size exceeds 100MB limit");
                return response;
            }

            // Create temporary file
            File tempFile = File.createTempFile("announcement_", fileName);
            Files.write(tempFile.toPath(), file.getBytes());

            // Upload to Cloudinary
            String fileUrl = null;
                try {
                    System.out.println("Uploading announcement to Cloudinary...");
                    fileUrl = CloudinaryFileUploadService.uploadFile(tempFile);
                    System.out.println("Cloudinary upload successful: " + fileUrl);
                } catch (Exception uploadError) {
                    System.err.println("Cloudinary upload failed: " + uploadError.getMessage());
                    uploadError.printStackTrace();
                    response.put("success", false);
                    response.put("message", "File upload to storage failed: " + uploadError.getMessage());
                    return response;
                }

            response.put("success", true);
            response.put("message", "File uploaded successfully");
            response.put("fileUrl", fileUrl);

            // Clean up temp file
            tempFile.delete();

        } catch (IOException e) {
            System.err.println("IO Error during announcement upload: " + e.getMessage());
            response.put("success", false);
            response.put("message", "File read error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error during announcement upload: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }
}
