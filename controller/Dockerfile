FROM openjdk:14.0.2-jdk-slim

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN ./gradlew build
CMD java -jar ./build/libs/*.jar
