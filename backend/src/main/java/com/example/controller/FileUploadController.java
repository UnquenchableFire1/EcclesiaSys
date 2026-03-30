import com.example.dao.AdminDAO;
import com.example.model.Admin;
import com.example.dao.UserProfilePictureDAO;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.dao.MemberDAO;
import com.example.model.Member;
import com.example.service.CloudinaryFileUploadService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    @PostMapping("/profile-picture")
    public Map<String, Object> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") int userId,
            @RequestParam("userType") String userType) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("=== Profile Picture Upload Request ===");
            System.out.println("User ID: " + userId + " (" + userType + ")");
            System.out.println("File: " + file.getOriginalFilename());
            
            // Validate file type (Images only)
            String fileName = file.getOriginalFilename();
            if (fileName == null || !fileName.toLowerCase().matches(".*\\.(jpg|jpeg|png|webp|gif)$")) {
                response.put("success", false);
                response.put("message", "Only image files (JPG, PNG, WEBP) are allowed");
                return response;
            }

            // Validate file size (10MB max for profile pictures)
            long maxSize = 10485760; // 10MB
            if (file.getSize() > maxSize) {
                response.put("success", false);
                response.put("message", "Image size exceeds 10MB limit");
                return response;
            }

            // Create temporary file
            File tempFile = File.createTempFile("profile_", fileName);
            Files.write(tempFile.toPath(), file.getBytes());

            // Upload to Cloudinary
            String profileUrl = null;
            try {
                profileUrl = CloudinaryFileUploadService.uploadFile(tempFile);
                System.out.println("Cloudinary profile upload successful: " + profileUrl);
            } catch (Exception uploadError) {
                System.err.println("Cloudinary upload failed: " + uploadError.getMessage());
                response.put("success", false);
                response.put("message", "Image upload failed: " + uploadError.getMessage());
                return response;
            } finally {
                tempFile.delete();
            }

            // Update Database
            boolean updated = false;
            if ("admin".equalsIgnoreCase(userType)) {
                AdminDAO adminDao = new AdminDAO();
                Admin admin = adminDao.getAdminById(userId);
                if (admin != null) {
                    admin.setProfilePictureUrl(profileUrl);
                    updated = adminDao.updateAdmin(admin);
                } else {
                    response.put("message", "Admin not found");
                }
            } else {
                MemberDAO memberDao = new MemberDAO();
                Member member = memberDao.getMemberById(userId);
                if (member != null) {
                    member.setProfilePictureUrl(profileUrl);
                    updated = memberDao.updateMember(member);
                } else {
                    response.put("message", "Member not found");
                }
            }

            if (updated) {
                // Record in history if possible
                try {
                    UserProfilePictureDAO historyDao = new UserProfilePictureDAO();
                    historyDao.addProfilePicture(userId, userType, profileUrl);
                } catch (Exception historyErr) {
                    System.err.println("Failed to record profile picture history: " + historyErr.getMessage());
                }

                response.put("success", true);
                response.put("message", "Profile picture updated successfully");
                response.put("profilePictureUrl", profileUrl);
            } else {
                response.put("success", false);
                if (!response.containsKey("message")) {
                    response.put("message", "Failed to update database record");
                }
            }

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "IO Error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

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
            if (fileName == null || (!fileName.endsWith(".mp3") && !fileName.endsWith(".mp4"))) {
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

            // Upload to B2
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

    @PostMapping("/event-document")
    public Map<String, Object> uploadEventDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "eventId", required = false) Integer eventId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file type (PDF, DOCX, TXT, XLSX, etc.)
            String fileName = file.getOriginalFilename();
            if (fileName == null || !fileName.toLowerCase().matches(".*\\.(pdf|doc|docx|txt|xlsx|xls|ppt|pptx)$")) {
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

            // Upload to B2
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

            // Upload to B2
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
