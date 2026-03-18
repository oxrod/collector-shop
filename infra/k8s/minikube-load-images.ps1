# Load locally built Docker images into Minikube.
# Kept for offline/manual mode.
# In the GHCR-based workflow, Kubernetes pulls images directly from `ghcr.io`.
# Usage: .\infra\k8s\minikube-load-images.ps1

$ErrorActionPreference = "Stop"

$images = @(
    "marketplace/backend-development:latest",
    "marketplace/backend-staging:latest",
    "marketplace/backend:latest",
    "marketplace/frontend-development:latest",
    "marketplace/frontend-staging:latest",
    "marketplace/frontend:latest",
    "marketplace/fraud-service-development:latest",
    "marketplace/fraud-service-staging:latest",
    "marketplace/fraud-service:latest",
    "marketplace/notification-service-development:latest",
    "marketplace/notification-service-staging:latest",
    "marketplace/notification-service:latest",
    "marketplace/keycloak-development:latest",
    "marketplace/keycloak-staging:latest",
    "marketplace/keycloak:latest"
)

foreach ($img in $images) {
    Write-Host "Loading $img into Minikube..."
    minikube image load $img
}

Write-Host ""
Write-Host "Done. (Offline/manual) Minikube can use these locally loaded images."
