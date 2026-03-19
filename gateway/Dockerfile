# Gateway: nginx with path-based routing to frontend, backend, keycloak.
# Build from repo root: docker build -t marketplace/gateway:latest -f infra/k8s/base/gateway/Dockerfile infra/k8s/base/gateway
FROM nginx:1.27-alpine

# Replace default config with gateway routing config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
