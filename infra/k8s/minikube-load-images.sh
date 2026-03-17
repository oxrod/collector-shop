#!/usr/bin/env bash
# Load locally built Docker images into Minikube.
# Run from repo root after building images on your host Docker (e.g. Docker Desktop).
# Usage: ./infra/k8s/minikube-load-images.sh

set -e

images=(
    marketplace/backend:latest
    marketplace/frontend:latest
    marketplace/fraud-service:latest
    marketplace/notification-service:latest
    marketplace/keycloak:latest
)

for img in "${images[@]}"; do
    echo "Loading $img into Minikube..."
    minikube image load "$img"
done

echo ""
echo "Done. Minikube can now use these images (no pull from registry)."
