package com.example.controller;

import com.example.dao.GalleryDAO;
import com.example.model.GalleryItem;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gallery")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GalleryController {

    private final GalleryDAO galleryDAO = new GalleryDAO();

    /** GET /api/gallery?branchId=&folder=&sermonsOnly= */
    @GetMapping
    public Map<String, Object> getGalleryItems(
            @RequestParam(value = "branchId", required = false) Integer branchId,
            @RequestParam(value = "folder", required = false) String folder,
            @RequestParam(value = "sermonsOnly", required = false) Boolean sermonsOnly) {

        Map<String, Object> response = new HashMap<>();
        try {
            List<GalleryItem> items = galleryDAO.getAllGalleryItems(branchId, folder, sermonsOnly);
            response.put("success", true);
            response.put("data", items);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch gallery: " + e.getMessage());
        }
        return response;
    }

    /** GET /api/gallery/folders?branchId= */
    @GetMapping("/folders")
    public Map<String, Object> getFolders(
            @RequestParam(value = "branchId", required = false) Integer branchId) {

        Map<String, Object> response = new HashMap<>();
        try {
            List<String> folders = galleryDAO.getFolderNames(branchId);
            response.put("success", true);
            response.put("data", folders);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch folders: " + e.getMessage());
        }
        return response;
    }

    /** POST /api/gallery */
    @PostMapping
    public Map<String, Object> createGalleryItem(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            GalleryItem item = new GalleryItem();
            item.setTitle((String) body.getOrDefault("title", "Untitled"));
            item.setCaption((String) body.getOrDefault("caption", ""));
            item.setMediaUrl((String) body.get("mediaUrl"));
            item.setMediaType((String) body.getOrDefault("mediaType", "PHOTO"));
            item.setSermon(Boolean.TRUE.equals(body.get("isSermon")));
            item.setThemeSong(Boolean.TRUE.equals(body.get("isThemeSong")));
            item.setSpeaker((String) body.get("speaker"));
            
            String sermonDateStr = (String) body.get("sermonDate");
            if (sermonDateStr != null && !sermonDateStr.isBlank()) {
                item.setSermonDate(java.time.LocalDateTime.parse(sermonDateStr));
            }

            String folderName = (String) body.get("folderName");
            item.setFolderName((folderName != null && !folderName.isBlank()) ? folderName.trim() : null);

            if (item.getMediaUrl() == null || item.getMediaUrl().isBlank()) {
                response.put("success", false);
                response.put("message", "Media URL is required");
                return response;
            }

            Object branchIdObj = body.get("branchId");
            if (branchIdObj != null && !branchIdObj.toString().isBlank()) {
                item.setBranchId(Integer.parseInt(branchIdObj.toString()));
            }

            Object uploadedByObj = body.get("uploadedBy");
            if (uploadedByObj != null) {
                item.setUploadedBy(Integer.parseInt(uploadedByObj.toString()));
            }

            item.setUploaderName((String) body.getOrDefault("uploaderName", "Media Team"));

            boolean created = galleryDAO.addGalleryItem(item);
            response.put("success", created);
            response.put("message", created ? "Item published to gallery!" : "Failed to save gallery item.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }

    /** DELETE /api/gallery/{id} */
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteGalleryItem(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean deleted = galleryDAO.deleteGalleryItem(id);
            response.put("success", deleted);
            response.put("message", deleted ? "Item removed from gallery." : "Could not find item to delete.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }
}
