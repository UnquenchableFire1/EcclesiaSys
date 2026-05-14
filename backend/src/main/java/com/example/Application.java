package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Base64;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.example"})
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    /**
     * Explicit root mapping to forward to index.html.
     * This helps ensure the frontend loads correctly on the base URL.
     */
    @Controller
    public static class RootController {
        @GetMapping("/")
        public String root() {
            return "forward:/index.html";
        }
    }


// CORS is now strictly handled by SecurityConfig.java leveraging Spring Security

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
            Integer statusCode = (Integer) request.getAttribute(jakarta.servlet.RequestDispatcher.ERROR_STATUS_CODE);
            
            if (uri != null && uri.startsWith("/api/")) {
                org.springframework.http.HttpStatus status = org.springframework.http.HttpStatus.valueOf(statusCode != null ? statusCode : 500);
                String message = status == org.springframework.http.HttpStatus.NOT_FOUND ? "API Endpoint Not Found" : "API Error: " + status.getReasonPhrase();
                
                return ResponseEntity.status(status)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body("{\"success\":false,\"message\":\"" + message + "\",\"status\":" + status.value() + "}");
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
