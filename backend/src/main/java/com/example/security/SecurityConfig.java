package com.example.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Disable CSRF since we are using JWT (stateless)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers("/api/login", "/api/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/branches").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/member/public/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/members/public").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/member/reset-password", "/api/member/custom-reset-password").permitAll()
                
                // Allow Frontend Static Resources (Single JAR deployment)
                .requestMatchers("/", "/index.html", "/static/**", "/assets/**", "/favicon.ico", "/*.js", "/*.css", "/*.png", "/*.jpg", "/*.svg").permitAll()
                
                // Allow static resources if any
                .requestMatchers("/api/upload/**").permitAll() // Temp allow uploads (or lock down later)
                
                // Require Auth for Everything Else
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Use allowedOrigins or allowedOriginPatterns for production.
        // For development, we allow the specific frontend URL.
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:5173", 
            "http://127.0.0.1:5173",
            "https://ecclesiasys-94po.onrender.com",
            "https://ecclesiasys-bequ.onrender.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
