package com.example.controller;

import com.example.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*")
public class VerificationController {

    @Autowired
    private EmailService emailService;

    // In-memory OTP storage: email -> {otp, expiry}
    private static final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private static final long OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required"));
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpStorage.put(email, new OtpData(otp, System.currentTimeMillis() + OTP_EXPIRY_MS));

        boolean sent = emailService.sendNotificationEmail(email, "Security Verification", 
            "Your verification code for EcclesiaSys is: " + otp + "\n\nThis code will expire in 10 minutes.");

        if (sent) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Verification code sent to " + email));
        } else {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Failed to send email"));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and OTP are required"));
        }

        OtpData data = otpStorage.get(email);
        if (data == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No OTP found for this email"));
        }

        if (System.currentTimeMillis() > data.expiry) {
            otpStorage.remove(email);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "OTP has expired"));
        }

        if (data.otp.equals(otp)) {
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid OTP"));
        }
    }

    public static boolean isValidOtp(String email, String otp) {
        OtpData data = otpStorage.get(email);
        if (data == null || System.currentTimeMillis() > data.expiry) {
            return false;
        }
        boolean valid = data.otp.equals(otp);
        if (valid) {
            otpStorage.remove(email); // Consume the OTP
        }
        return valid;
    }

    private static class OtpData {
        String otp;
        long expiry;

        OtpData(String otp, long expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }
}
