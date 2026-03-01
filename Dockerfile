FROM node:18-alpine AS node_builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --silent || npm ci --legacy-peer-deps
COPY frontend/ .
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS maven_builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:resolve
COPY backend/ .
RUN mvn clean package -DskipTests

FROM tomcat:10-jre21
WORKDIR /usr/local/tomcat
RUN rm -rf webapps/*
# Copy built frontend into ROOT so site is served at /
COPY --from=node_builder /frontend/build ./webapps/ROOT
# Copy backend WAR for API endpoints under /api
COPY --from=maven_builder /app/target/bbj-church-manager.war ./webapps/api.war
EXPOSE 8080
CMD ["catalina.sh", "run"]
