package com.example.utils;

import com.example.db.DBConnection;
import java.sql.Connection;
import java.sql.Statement;

public class SchemaFix {
    public static void main(String[] args) {
        System.out.println("Starting Schema and Data Fix...");
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Checking and updating 'admins' table...");
            
            // Add missing columns if they don't exist
            try {
                stmt.execute("ALTER TABLE admins ADD COLUMN profile_picture_url TEXT");
                System.out.println("✓ Added profile_picture_url to admins");
            } catch (Exception e) {
                System.out.println("- profile_picture_url already exists or error: " + e.getMessage());
            }
            
            try {
                stmt.execute("ALTER TABLE admins ADD COLUMN gender VARCHAR(20)");
                System.out.println("✓ Added gender to admins");
            } catch (Exception e) {
                System.out.println("- gender already exists or error: " + e.getMessage());
            }
            
            try {
                stmt.execute("ALTER TABLE admins ADD COLUMN bio TEXT");
                System.out.println("✓ Added bio to admins");
            } catch (Exception e) {
                System.out.println("- bio already exists or error: " + e.getMessage());
            }
            
            try {
                stmt.execute("ALTER TABLE admins ADD COLUMN phone_number VARCHAR(20)");
                System.out.println("✓ Added phone_number to admins");
            } catch (Exception e) {
                System.out.println("- phone_number already exists or error: " + e.getMessage());
            }

            // Sync Admin Email to the desired one
            try {
                int updated = stmt.executeUpdate("UPDATE admins SET email = 'benjaminbuckmanjunior@gmail.com' WHERE email = 'benjamin@ecclesiasy.com' OR id = 1");
                if (updated > 0) {
                    System.out.println("✓ Updated admin email to benjaminbuckmanjunior@gmail.com");
                } else {
                    System.out.println("- Admin email already updated or not found");
                }
            } catch (Exception e) {
                System.err.println("! Error updating admin email: " + e.getMessage());
            }
            
            System.out.println("Schema update completed successfully.");
            
        } catch (Exception e) {
            System.err.println("Fatal error during schema update:");
            e.printStackTrace();
        }
    }
}
