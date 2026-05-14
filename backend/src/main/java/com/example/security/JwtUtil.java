package com.example.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Use a persistent secret from environment variables or a fallback for development.
    private static final Key SECRET_KEY = createKey();

    private static Key createKey() {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.trim().isEmpty()) {
            secret = "cop-ayikai-doblo-default-secret-key-1234567890";
        }
        // JJWT requires at least 256 bits (32 bytes) for HMAC-SHA256 algorithms.
        // If the user provides a short secret, pad it gracefully to prevent startup crashes.
        while (secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            secret += secret;
        }
        return Keys.hmacShaKeyFor(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
    
    // 48 hours in milliseconds
    private static final long EXPIRATION_TIME = 172800000L;

    public String generateToken(String email, int userId, String userType, Integer branchId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("userType", userType); // "admin" or "member"
        claims.put("branchId", branchId);
        claims.put("role", role); // "SUPER_ADMIN", "BRANCH_ADMIN", etc.
        return createToken(claims, email);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // Email
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    public Boolean validateToken(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email) && !isTokenExpired(token));
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Integer extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Integer.class);
    }

    public String extractUserType(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userType", String.class);
    }

    public Integer extractBranchId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("branchId", Integer.class);
    }
    
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
