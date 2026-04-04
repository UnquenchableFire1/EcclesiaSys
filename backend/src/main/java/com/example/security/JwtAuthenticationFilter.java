package com.example.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // Exclude specific public paths to avoid processing JWTs unnecessarily
        String path = request.getRequestURI();
        if (path.startsWith("/api/login") || path.startsWith("/api/register")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                // Token is malformed or invalid
                logger.warn("JWT extraction failed: " + e.getMessage());
            }
        }

        // Validate the token and configure Spring Security context if not already set
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            if (jwtUtil.validateToken(jwt, email)) {
                
                // You can extract custom roles here from the JWT and convert to Spring GrantedAuthorities.
                // For this implementation, we set authorities to empty, as our controllers primarily
                // use manual logic, but Security Context ensures they are authenticated.
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        email, null, new ArrayList<>());
                
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                // Set custom attributes to the request so Controllers can easily access them without parsing JWT again
                request.setAttribute("userId", jwtUtil.extractUserId(jwt));
                request.setAttribute("userType", jwtUtil.extractUserType(jwt));
                request.setAttribute("branchId", jwtUtil.extractBranchId(jwt));
                request.setAttribute("role", jwtUtil.extractRole(jwt));
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
