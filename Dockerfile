# Multi-stage: Build Spring Boot JAR with integrated React frontend
FROM maven:3.9-eclipse-temurin-17 AS maven_builder

WORKDIR /app

# Copy Maven configuration
COPY backend/pom.xml .

# Download dependencies
RUN mvn dependency:resolve

# Copy source code (includes React build in src/main/resources/static/)
COPY backend/ .

# Build the JAR with embedded Tomcat and React frontend
RUN mvn clean package -DskipTests

# Runtime stage: Minimal JRE image
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy compiled JAR from builder
COPY --from=maven_builder /app/target/bbj-church-manager-1.0.0.jar app.jar

# Set production Spring profile to use application-production.properties
ENV SPRING_PROFILES_ACTIVE=production

# Expose port (Render will set PORT environment variable at runtime)
EXPOSE 8080

# Run the Spring Boot application with embedded Tomcat
# Spring will read server.port=${PORT:8080} from application-production.properties
CMD ["java", "-jar", "app.jar"]
