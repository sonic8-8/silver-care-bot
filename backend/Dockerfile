ARG JAVA_VERSION=17

# syntax=docker/dockerfile:1.4
FROM eclipse-temurin:${JAVA_VERSION}-jdk AS builder
WORKDIR /app

COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew --no-daemon dependencies

COPY . .
RUN chmod +x gradlew
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew --no-daemon bootJar -x test

FROM eclipse-temurin:${JAVA_VERSION}-jre
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
