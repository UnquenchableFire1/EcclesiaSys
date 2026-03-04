package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.SermonDAO;
import com.example.model.Sermon;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sermons")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SermonController {

    @GetMapping
    public Map<String, Object> getAllSermons() {
        Map<String, Object> response = new HashMap<>();
        try {
            SermonDAO dao = new SermonDAO();
            List<Sermon> sermons = dao.getAllSermons();
            response.put("success", true);
            response.put("data", sermons);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getSermonById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            SermonDAO dao = new SermonDAO();
            Sermon sermon = dao.getSermonById(id);
            if (sermon != null) {
                response.put("success", true);
                response.put("data", sermon);
            } else {
                response.put("success", false);
                response.put("message", "Sermon not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping
    public Map<String, Object> createSermon(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Sermon sermon = new Sermon(
                    (String) request.get("title"),
                    (String) request.get("description"),
                    (String) request.get("filePath"),
                    (String) request.get("fileType"),
                    ((Number) request.get("uploadedBy")).intValue()
            );
            
            SermonDAO dao = new SermonDAO();
            if (dao.addSermon(sermon)) {
                response.put("success", true);
                response.put("message", "Sermon created");
            } else {
                response.put("success", false);
                response.put("message", "Failed to create sermon");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateSermon(@PathVariable int id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Sermon sermon = new Sermon(
                    (String) request.get("title"),
                    (String) request.get("description"),
                    (String) request.get("filePath"),
                    (String) request.get("fileType"),
                    ((Number) request.get("uploadedBy")).intValue()
            );
            sermon.setId(id);
            
            SermonDAO dao = new SermonDAO();
            if (dao.updateSermon(sermon)) {
                response.put("success", true);
                response.put("message", "Sermon updated");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update sermon");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteSermon(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            SermonDAO dao = new SermonDAO();
            if (dao.deleteSermon(id)) {
                response.put("success", true);
                response.put("message", "Sermon deleted");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete sermon");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
