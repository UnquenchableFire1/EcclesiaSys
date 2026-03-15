package com.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class UpdateAdminEmail {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/bbj?useSSL=true&serverTimezone=UTC";
        String user = "nrMPj1ECajN3NtY.root";
        String password = "dFkBlyj7CjtmqK08";
        
        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected to TiDB successfully.");
            
            // First, check current state before update
            System.out.println("\n--- Current Admin Accounts ---");
            Statement checkStmt = conn.createStatement();
            ResultSet rs = checkStmt.executeQuery("SELECT id, email, actual_email, first_name, last_name FROM members WHERE email LIKE '%@ecclesiasys.com' OR email LIKE '%@bbj.com' OR first_name='Benjamin'");
            while(rs.next()) {
                System.out.printf("ID: %d | System Email: %s | Personal Email: %s | Name: %s %s%n",
                    rs.getInt("id"), rs.getString("email"), rs.getString("actual_email"), rs.getString("first_name"), rs.getString("last_name"));
            }
            
            // Perform Update
            String updateSql = "UPDATE members SET actual_email = ? WHERE email = ?";
            PreparedStatement pstmt = conn.prepareStatement(updateSql);
            
            // Update for the specific admin email
            pstmt.setString(1, "benjaminbuckmanjunior@gmail.com");
            pstmt.setString(2, "benjamin@ecclesiasys.com");
            int rowsV1 = pstmt.executeUpdate();
            
            // Also update the legacy bbj.com email just in case they are trying that one
            pstmt.setString(1, "benjaminbuckmanjunior@gmail.com");
            pstmt.setString(2, "benjamin@bbj.com");
            int rowsV2 = pstmt.executeUpdate();
            
            System.out.println("\n--- Update Results ---");
            System.out.println("Updated benjamin@ecclesiasys.com: " + rowsV1 + " rows");
            System.out.println("Updated benjamin@bbj.com: " + rowsV2 + " rows");
            
            // Verify
            System.out.println("\n--- Verified State ---");
            ResultSet rs2 = checkStmt.executeQuery("SELECT id, email, actual_email FROM members WHERE actual_email='benjaminbuckmanjunior@gmail.com'");
            while(rs2.next()) {
                System.out.printf("Verified -> ID: %d | System Email: %s | Personal Email: %s%n",
                    rs2.getInt("id"), rs2.getString("email"), rs2.getString("actual_email"));
            }
            
            conn.close();
            System.out.println("\nOperation completed successfully.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
