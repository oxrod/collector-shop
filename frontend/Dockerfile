FROM node:20-alpine AS builder

ARG VITE_API_URL=/api
ARG VITE_KEYCLOAK_URL=
ARG VITE_KEYCLOAK_REALM=marketplace
ARG VITE_KEYCLOAK_CLIENT_ID=marketplace-app

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Inject Vite env vars at build time.
# Vite reads `process.env.VITE_*` while compiling.
ENV VITE_API_URL=$VITE_API_URL \
    VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
