package com.example.config;

import java.io.InputStream;
import java.util.Properties;

public class ConfigManager {
    private static Properties properties = new Properties();
    private static final String ENV = System.getenv("ENVIRONMENT") != null 
        ? System.getenv("ENVIRONMENT") 
        : "local";  // local, staging, production

    static {
        try {
            String configFile = "/config-" + ENV + ".properties";
            InputStream input = ConfigManager.class.getResourceAsStream(configFile);
            if (input != null) {
                properties.load(input);
            } else {
                System.err.println("Config file not found: " + configFile);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getProperty(String key) {
        return properties.getProperty(key);
    }

    public static String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public static String getEnvironment() {
        return ENV;
    }

    // Database Properties
    public static String getDbUrl() {
        // Try environment variable first
        String envUrl = System.getenv("DB_URL");
        if (envUrl != null && !envUrl.isEmpty()) {
            return envUrl;
        }
        return getProperty("db.url");
    }

    public static String getDbUsername() {
        // Try environment variable first
        String envUser = System.getenv("DB_USERNAME");
        if (envUser != null && !envUser.isEmpty()) {
            return envUser;
        }
        return getProperty("db.username");
    }

    public static String getDbPassword() {
        // Try environment variable first
        String envPass = System.getenv("DB_PASSWORD");
        if (envPass != null && !envPass.isEmpty()) {
            return envPass;
        }
        return getProperty("db.password");
    }

    // Backblaze B2 Properties
    public static String getB2KeyId() {
        // Try environment variable first
        String envKeyId = System.getenv("B2_KEY_ID");
        if (envKeyId != null && !envKeyId.isEmpty()) {
            return envKeyId;
        }
        return getProperty("b2.keyId");
    }

    public static String getB2ApplicationKey() {
        // Try environment variable first
        String envAppKey = System.getenv("B2_APP_KEY");
        if (envAppKey != null && !envAppKey.isEmpty()) {
            return envAppKey;
        }
        return getProperty("b2.applicationKey");
    }

    public static String getB2BucketName() {
        // Try environment variable first
        String envBucket = System.getenv("B2_BUCKET_NAME");
        if (envBucket != null && !envBucket.isEmpty()) {
            return envBucket;
        }
        return getProperty("b2.bucketName");
    }

    // File Upload Properties
    public static String getUploadDir() {
        return getProperty("upload.dir", "/uploads");
    }

    public static long getMaxFileSize() {
        String size = getProperty("upload.maxSize", "524288000"); // 500MB default
        return Long.parseLong(size);
    }
}
