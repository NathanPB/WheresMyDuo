FROM openjdk:14.0.2-jdk-slim


# Add docker-compose-wait tool
ENV WAIT_VERSION 2.7.3
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN ./gradlew build
CMD /wait && java -jar ./build/libs/*.jar
