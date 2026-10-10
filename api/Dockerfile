FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
# Windows checkouts can have CRLF line endings, which break the script on Linux
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

COPY src src
RUN for i in 1 2 3 4 5 6; do ./gradlew bootJar -x test --no-daemon && exit 0; echo "retry $i"; sleep 30; done; exit 1

FROM eclipse-temurin:21-jre
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-Xmx300m","-jar","/app.jar"]