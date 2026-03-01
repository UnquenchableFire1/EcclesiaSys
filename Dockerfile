FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:resolve
COPY backend .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/bbj-church-manager.war app.war
EXPOSE 8080
CMD ["java", "-jar", "app.war"]
