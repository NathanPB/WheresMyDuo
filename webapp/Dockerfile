# Stage 1 - Build Environment
FROM node:lts-alpine3.12 as build
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build

# Stage 2 - Production Server
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
ADD ./nginx-config.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
