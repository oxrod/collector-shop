# Start Minikube and prepare for deployment.
# Run from repo root: .\infra\k8s\minikube-start.ps1
# Optional: pass -Bootstrap to run local bootstrap guidance.
# Optional: pass -ArgoCD to install and bootstrap Argo CD apps.

param(
    [switch]$Bootstrap,
    [switch]$ArgoCD
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Minikube..."
minikube start --driver=docker

Write-Host "Using Minikube context..."
kubectl config use-context minikube

Write-Host "Enabling ingress addon..."
minikube addons enable ingress

if ($Bootstrap) {
    Write-Host "Running bootstrap (secrets + ConfigMap)..."
    & (Join-Path $PSScriptRoot "minikube-bootstrap.ps1")
}

if ($ArgoCD) {
    Write-Host "Running Argo CD bootstrap..."
    & (Join-Path $PSScriptRoot "minikube-argocd-bootstrap.ps1")
}

Write-Host ""
Write-Host "Minikube is ready."
Write-Host "  - Images are pulled from GHCR by Kubernetes (no Minikube image load needed)"
Write-Host "  - If you run offline/manual mode, you can still use minikube-load-images.ps1"
Write-Host "  - Deploy (dev): kubectl apply -k infra/k8s/overlays/dev"
Write-Host "  - Argo CD flow: .\infra\k8s\minikube-start.ps1 -ArgoCD (or run bootstrap script directly)"
Write-Host "  - Dashboard:    minikube dashboard"
