# Start Minikube and prepare for deployment.
# Run from repo root: .\infra\k8s\minikube-start.ps1
# Optional: pass -Bootstrap to also create secrets and ConfigMap.

param(
    [switch]$Bootstrap
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Minikube..."
minikube start

Write-Host "Using Minikube context..."
kubectl config use-context minikube

Write-Host "Enabling ingress addon..."
minikube addons enable ingress

if ($Bootstrap) {
    Write-Host "Running bootstrap (secrets + ConfigMap)..."
    & (Join-Path $PSScriptRoot "minikube-bootstrap.ps1")
}

Write-Host ""
Write-Host "Minikube is ready."
Write-Host "  - Build images: docker build -t marketplace/backend:latest ./backend  (and other services)"
Write-Host "  - Load images:  .\infra\k8s\minikube-load-images.ps1"
Write-Host "  - Deploy (dev): kubectl apply -k infra/k8s/overlays/dev"
Write-Host "  - Dashboard:    minikube dashboard"
