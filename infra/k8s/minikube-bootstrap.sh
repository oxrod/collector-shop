#!/usr/bin/env bash
# Bootstrap secrets and config for Minikube deployment.
# Run from repo root: ./infra/k8s/minikube-bootstrap.sh

set -e

echo "Creating namespace defaults (optional)..."
kubectl create namespace marketplace 2>/dev/null || true

echo "Creating db-credentials secret..."
kubectl create secret generic db-credentials \
  --from-literal=username=marketplace \
  --from-literal=password=marketplace_secret \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Creating keycloak-credentials secret..."
kubectl create secret generic keycloak-credentials \
  --from-literal=admin-password=admin \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Creating postgres-init ConfigMap..."
kubectl create configmap postgres-init \
  --from-file=init.sql=infra/k8s/postgres/init.sql \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Done. Apply manifests with: kubectl apply -f infra/k8s/"
