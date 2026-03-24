package com.example.controller;

import org.springframework.web.bind.annotation.*;
import com.example.dao.BranchDAO;
import com.example.model.Branch;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BranchController {

    @GetMapping
    public Map<String, Object> getAllBranches() {
        Map<String, Object> response = new HashMap<>();
        try {
            BranchDAO dao = new BranchDAO();
            List<Branch> branches = dao.getAllBranches();
            response.put("success", true);
            response.put("data", branches);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getBranchById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            BranchDAO dao = new BranchDAO();
            Branch branch = dao.getBranchById(id);
            if (branch != null) {
                response.put("success", true);
                response.put("data", branch);
            } else {
                response.put("success", false);
                response.put("message", "Branch not found");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping
    public Map<String, Object> createBranch(@RequestBody Branch branch) {
        Map<String, Object> response = new HashMap<>();
        try {
            BranchDAO dao = new BranchDAO();
            if (dao.addBranch(branch)) {
                response.put("success", true);
                response.put("message", "Branch created successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to create branch");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteBranch(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            BranchDAO dao = new BranchDAO();
            int affected = dao.deleteBranch(id);
            if (affected > 0) {
                response.put("success", true);
                response.put("message", "Branch deleted successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete branch: Branch ID not found.");
            }
        } catch (java.sql.SQLException e) {
            response.put("success", false);
            response.put("message", "Database Error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }
}
