package com.example.db;

import java.sql.Connection;
import java.sql.DriverManager;
import com.example.config.ConfigManager;

public class DBConnection {
    
    public static Connection getConnection() {
        try {
            // Load configuration based on environment
            String env = System.getenv("ENVIRONMENT");
            env = env != null ? env : "local";
            
            String url, username, password;
            
            if ("production".equals(env)) {
                // Use environment variables for production
                url = System.getenv("DB_URL");
                username = System.getenv("DB_USERNAME");
                password = System.getenv("DB_PASSWORD");
                
                // Fallback to ConfigManager if env vars not set
                if (url == null) url = ConfigManager.getDbUrl();
                if (username == null) username = ConfigManager.getDbUsername();
                if (password == null) password = ConfigManager.getDbPassword();
                
                System.out.println("✓ Production mode - Using TiDB Cloud");
            } else {
                // Local Development - use ConfigManager
                url = ConfigManager.getDbUrl();
                username = ConfigManager.getDbUsername();
                password = ConfigManager.getDbPassword();
                System.out.println("✓ Local mode - Using local MySQL");
            }
            
            if (url == null || username == null || password == null) {
                throw new RuntimeException("Database configuration incomplete. Check environment variables or config file.");
            }
            
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(url, username, password);
            conn.setAutoCommit(true);
            System.out.println("✓ Database connected (" + env + ") with autocommit=true");
            System.out.println("  URL: " + url.substring(0, Math.min(50, url.length())) + "...");
            return conn;
        } catch(Exception e) {
            System.err.println("✗ Database connection failed!");
            System.err.println("  Check DB_URL, DB_USERNAME, DB_PASSWORD environment variables");
            e.printStackTrace();
        }
        return null;
    }
    
    // Test connection
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
