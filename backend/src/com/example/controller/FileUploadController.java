package com.example.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.dao.SermonDAO;
import com.example.model.Sermon;
import com.example.service.B2FileUploadService;
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
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("adminId") int adminId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
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

            // Upload to Backblaze B2
            String fileUrl = B2FileUploadService.uploadFile(tempFile);

            // Extract file type
            String fileType = fileName.endsWith(".mp4") ? "mp4" : "mp3";

            // Save to database
            Sermon sermon = new Sermon(title, description, fileUrl, fileType, adminId);
            SermonDAO dao = new SermonDAO();
            
            if (dao.addSermon(sermon)) {
                response.put("success", true);
                response.put("message", "Sermon uploaded successfully");
                response.put("fileUrl", fileUrl);
            } else {
                response.put("success", false);
                response.put("message", "Failed to save sermon metadata");
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
}
