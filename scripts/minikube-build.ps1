# Build all app images and load them into Minikube (so no registry pull is needed).
# Run from repo root. Requires: minikube, docker.
# Usage: .\scripts\minikube-build.ps1

$ErrorActionPreference = "Stop"

Write-Host "Using Minikube's Docker daemon..."
& minikube -p minikube docker-env | Invoke-Expression

Write-Host "Building backend..."
docker build -t marketplace/backend:latest ./backend

Write-Host "Building frontend..."
docker build -t marketplace/frontend:latest ./frontend

Write-Host "Building fraud-service..."
docker build -t marketplace/fraud-service:latest ./fraud-service

Write-Host "Building notification-service..."
docker build -t marketplace/notification-service:latest ./notification-service

Write-Host "Building keycloak (auth)..."
docker build -t marketplace/keycloak:latest ./auth

Write-Host "Done. Images are in Minikube. Apply manifests with: kubectl apply -f infra/k8s/"
