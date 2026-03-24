package com.example.test;

import com.example.dao.BranchDAO;
import java.util.List;
import com.example.model.Branch;

public class TestDeleteBranch {
    public static void main(String[] args) {
        BranchDAO dao = new BranchDAO();
        List<Branch> branches = dao.getAllBranches();
        if (branches.isEmpty()) {
            System.out.println("No branches to delete.");
            return;
        }
        Branch testBranch = branches.get(0);
        System.out.println("Attempting to delete branch: " + testBranch.getName() + " (ID " + testBranch.getId() + ")");
        
        try {
            int affected = dao.deleteBranch(testBranch.getId());
            if (affected > 0) {
                System.out.println("Successfully deleted branch.");
            } else {
                System.out.println("Failed to delete branch. Branch ID not found.");
            }
        } catch (java.sql.SQLException e) {
            System.err.println("SQL Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
