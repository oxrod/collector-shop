#!/usr/bin/env bash
# Start Minikube and prepare for deployment.
# Run from repo root: ./infra/k8s/minikube-start.sh
# Optional: pass --bootstrap to also create secrets and ConfigMap.

set -e

BOOTSTRAP=false
for arg in "$@"; do
  case $arg in
    --bootstrap) BOOTSTRAP=true ;;
  esac
done

echo "Starting Minikube..."
minikube start

echo "Using Minikube context..."
kubectl config use-context minikube

echo "Enabling ingress addon..."
minikube addons enable ingress

if [[ "$BOOTSTRAP" == "true" ]]; then
  echo "Running bootstrap (secrets + ConfigMap)..."
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  "$SCRIPT_DIR/minikube-bootstrap.sh"
fi

echo ""
echo "Minikube is ready."
echo "  - Images are pulled from GHCR by Kubernetes (no Minikube image load needed)"
echo "  - If you run offline/manual mode, you can still use minikube-load-images.sh"
echo "  - Apply manifests: kubectl apply -f infra/k8s/"
echo "  - Dashboard: minikube dashboard"
