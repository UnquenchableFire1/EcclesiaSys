package com.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class VerifyAdminEmail {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/bbj?useSSL=true&serverTimezone=UTC";
        String user = "nrMPj1ECajN3NtY.root";
        String password = "dFkBlyj7CjtmqK08";
        
        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected to TiDB successfully.");
            
            Statement checkStmt = conn.createStatement();
            ResultSet rs = checkStmt.executeQuery("SELECT id, email, actual_email FROM members WHERE first_name='Benjamin' OR email LIKE '%benjamin%'");
            while(rs.next()) {
                System.out.printf("ID: %d | System Email: '%s' | Personal Email: '%s'%n",
                    rs.getInt("id"), rs.getString("email"), rs.getString("actual_email"));
            }
            
            conn.close();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
