package com.example.service;

import java.io.File;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Formatter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class CloudinaryFileUploadService {

    private static String apiKey;
    private static String apiSecret;
    private static String cloudName;

    static {
        try {
            String cloudinaryUrl = System.getenv("CLOUDINARY_URL");
            if (cloudinaryUrl != null && cloudinaryUrl.startsWith("cloudinary://")) {
                // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
                String trimmed = cloudinaryUrl.substring("cloudinary://".length());
                String[] parts = trimmed.split("@", 2);
                if (parts.length == 2) {
                    String creds = parts[0];
                    cloudName = parts[1];
                    String[] kv = creds.split(":", 2);
                    if (kv.length == 2) {
                        apiKey = kv[0];
                        apiSecret = kv[1];
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Cloudinary URL parse error: " + e.getMessage());
        }
    }

    private static String sha1Hex(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] bytes = md.digest(input.getBytes("UTF-8"));
        try (Formatter f = new Formatter()) {
            for (byte b : bytes) {
                f.format("%02x", b);
            }
            return f.toString();
        }
    }

    public static String uploadFile(File file) throws Exception {
        if (apiKey == null || apiSecret == null || cloudName == null) {
            throw new Exception("CLOUDINARY_URL not configured");
        }

        long timestamp = Instant.now().getEpochSecond();
        String toSign = "timestamp=" + timestamp;
        String signature = sha1Hex(toSign + apiSecret);

        String uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/auto/upload";
        URL url = new URL(uploadUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");

        String boundary = "----CloudinaryBoundary" + System.currentTimeMillis();
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        try (OutputStream out = conn.getOutputStream()) {
            // file field
            String filePartHeader = "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getName() + "\"\r\n" +
                    "Content-Type: application/octet-stream\r\n\r\n";
            out.write(filePartHeader.getBytes("UTF-8"));
            Files.copy(file.toPath(), out);
            out.write("\r\n".getBytes("UTF-8"));

            // api_key
            String apiKeyPart = "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"api_key\"\r\n\r\n" + apiKey + "\r\n";
            out.write(apiKeyPart.getBytes("UTF-8"));

            // timestamp
            String tsPart = "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"timestamp\"\r\n\r\n" + timestamp + "\r\n";
            out.write(tsPart.getBytes("UTF-8"));

            // signature
            String sigPart = "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"signature\"\r\n\r\n" + signature + "\r\n";
            out.write(sigPart.getBytes("UTF-8"));

            // end boundary
            String end = "--" + boundary + "--\r\n";
            out.write(end.getBytes("UTF-8"));
            out.flush();
        }

        int resp = conn.getResponseCode();
        InputStream is = (resp >= 200 && resp < 300) ? conn.getInputStream() : conn.getErrorStream();
        String body = new String(is.readAllBytes());
        if (resp >= 200 && resp < 300) {
            ObjectMapper mapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> json = mapper.readValue(body, Map.class);
            Object secure = json.get("secure_url");
            if (secure == null) {
                secure = json.get("url");
            }
            if (secure != null) {
                return secure.toString();
            }
            throw new Exception("Cloudinary upload succeeded but no URL returned");
        } else {
            throw new Exception("Cloudinary upload failed: HTTP " + resp + " - " + body);
        }
    }
}
