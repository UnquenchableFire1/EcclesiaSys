package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Base64;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
@ComponentScan(basePackages = {"com.example"})
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Configuration
    public static class CorsConfig implements WebMvcConfigurer {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .maxAge(3600);
        }
    }

    /**
     * Error controller for React SPA routing.
     * Catches all 404s (e.g., deep links and page refreshes) and forwards them to index.html 
     * so React Router can take over. Returns a JSON 404 for missing API routes.
     */
    @Controller
    public static class SpaErrorController implements org.springframework.boot.web.servlet.error.ErrorController {
        
        @org.springframework.web.bind.annotation.RequestMapping("/error")
        public Object handleError(jakarta.servlet.http.HttpServletRequest request) {
            String uri = (String) request.getAttribute(jakarta.servlet.RequestDispatcher.ERROR_REQUEST_URI);
            if (uri != null && uri.startsWith("/api/")) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body("{\"success\":false,\"message\":\"API Endpoint Not Found\"}");
            }
            return "forward:/index.html";
        }
    }

    @Controller
    public static class FaviconController {
        private static final String ONE_BY_ONE_PNG_BASE64 =
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";

        @GetMapping(value = "/favicon.ico")
        public ResponseEntity<byte[]> favicon() {
            byte[] image = Base64.getDecoder().decode(ONE_BY_ONE_PNG_BASE64);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            return ResponseEntity.ok().headers(headers).body(image);
        }
    }
}
