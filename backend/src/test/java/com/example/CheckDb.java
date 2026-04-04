package com.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/bbj?useSSL=true&serverTimezone=UTC";
        String user = "nrMPj1ECajN3NtY.root";
        String password = "dFkBlyj7CjtmqK08";
        
        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, email, actual_email, first_name, last_name FROM members");
            
            System.out.println("=== MEMBERS TABLE DUMP ===");
            while (rs.next()) {
                System.out.printf("ID: %d | SystemEmail: %s | ActualEmail: %s | Name: %s %s%n",
                                  rs.getInt("id"),
                                  rs.getString("email"),
                                  rs.getString("actual_email"),
                                  rs.getString("first_name"),
                                  rs.getString("last_name"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
