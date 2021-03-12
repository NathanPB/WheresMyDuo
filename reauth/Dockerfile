FROM nathanpb/reauth:0.3.1

# Add docker-compose-wait tool
ENV WAIT_VERSION 2.7.3
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

WORKDIR /usr/src/app
ADD providers.json .
ADD identity.json .
ADD scopes.json .
CMD /wait && java -jar ./build/libs/*.jar
