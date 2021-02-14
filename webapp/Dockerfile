# Stage 1 - Build Environment
FROM node:lts-alpine3.12 as build
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build

# Stage 2 - Production Server
FROM node:lts-alpine3.12
WORKDIR /app
COPY --from=build /app/.next .next
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/public public
CMD ["npx", "next", "start", "-p", "80"]
