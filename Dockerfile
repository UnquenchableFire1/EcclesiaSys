# Multi-stage build: Node.js for React, Maven for Spring Boot

# Stage 1: Build React frontend
FROM node:18 AS node_builder

ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies with legacy peer deps support, deleting the Windows lockfile first so Linux can pull correct native binaries
RUN rm -f package-lock.json && npm install --legacy-peer-deps --no-audit || npm install --legacy-peer-deps --force


# Copy source code
COPY frontend/ .

# Build React (output goes to /frontend/build)
RUN npm run build

# Stage 2: Build Spring Boot JAR with integrated React
FROM maven:3.9-eclipse-temurin-17 AS maven_builder

WORKDIR /app

# Copy Maven configuration
COPY backend/pom.xml .

# Download dependencies
RUN mvn dependency:resolve

# Copy backend source
COPY backend/ .

# Copy built React frontend into backend static resources (Vite outputs to dist)
COPY --from=node_builder /frontend/dist ./src/main/resources/static

# Build the JAR (now includes React frontend)
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy compiled JAR from Maven builder
COPY --from=maven_builder /app/target/bbj-church-manager-1.0.0.jar app.jar

# Set production Spring profile
ENV SPRING_PROFILES_ACTIVE=production

# Expose port (Render assigns dynamically)
EXPOSE 8080

# Configure JVM memory limits for Render Free Tier (512MB)
ENV JAVA_OPTS="-Xmx300m -Xms150m"

# Run Spring Boot application
CMD sh -c "java $JAVA_OPTS -jar app.jar"
