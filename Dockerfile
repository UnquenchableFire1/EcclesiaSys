FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:resolve
COPY backend .
RUN mvn clean package -DskipTests

FROM tomcat:10-jre21
WORKDIR /usr/local/tomcat
RUN rm -rf webapps/*
COPY --from=builder /app/target/bbj-church-manager.war webapps/api.war
EXPOSE 8080
CMD ["catalina.sh", "run"]
