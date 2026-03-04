# Use pre-built Spring Boot JAR with embedded Tomcat and integrated React frontend
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the pre-built JAR that contains Spring Boot, Tomcat, and React frontend
COPY backend/target/bbj-church-manager-1.0.0.jar app.jar

# Expose port for Render (Render may override this)
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
