#!/usr/bin/env bash
# Build all app images and load them into Minikube (so no registry pull is needed).
# Run from repo root. Requires: minikube, docker.
# Usage: ./scripts/minikube-build.sh

set -e

echo "Using Minikube's Docker daemon..."
eval $(minikube docker-env)

echo "Building backend..."
docker build -t marketplace/backend:latest ./backend

echo "Building frontend..."
docker build -t marketplace/frontend:latest ./frontend

echo "Building fraud-service..."
docker build -t marketplace/fraud-service:latest ./fraud-service

echo "Building notification-service..."
docker build -t marketplace/notification-service:latest ./notification-service

echo "Building keycloak (auth)..."
docker build -t marketplace/keycloak:latest ./auth

echo "Done. Images are in Minikube. Apply manifests with: kubectl apply -f infra/k8s/"
