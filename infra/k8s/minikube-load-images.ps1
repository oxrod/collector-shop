# Load locally built Docker images into Minikube.
# Run from repo root after building images on your host Docker (e.g. Docker Desktop).
# Usage: .\infra\k8s\minikube-load-images.ps1

$ErrorActionPreference = "Stop"

$images = @(
    "marketplace/backend:latest",
    "marketplace/frontend:latest",
    "marketplace/fraud-service:latest",
    "marketplace/notification-service:latest",
    "marketplace/keycloak:latest"
)

foreach ($img in $images) {
    Write-Host "Loading $img into Minikube..."
    minikube image load $img
}

Write-Host ""
Write-Host "Done. Minikube can now use these images (no pull from registry)."
