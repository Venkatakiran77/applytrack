FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# dependencies first, so this layer is cached until build files change
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
# Windows checkouts can have CRLF line endings, which break the script on Linux
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
RUN ./gradlew dependencies --no-daemon > /dev/null

COPY src src
RUN ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /
COPY --from=build /app/build/libs/app.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]