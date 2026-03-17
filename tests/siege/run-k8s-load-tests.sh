#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

NAMESPACE="${NAMESPACE:-staging}"
INGRESS_NS="${INGRESS_NS:-ingress-nginx}"
INGRESS_SVC="${INGRESS_SVC:-ingress-nginx-controller}"
INGRESS_LOCAL_PORT="${INGRESS_LOCAL_PORT:-8080}"

INGRESS_HOSTS_DEV="marketplace.local"
INGRESS_HOSTS_STAGING="staging.marketplace.local"
INGRESS_HOSTS_PRODUCTION="marketplace.example.com"

PF_PIDS=()

cleanup() {
  echo ""
  echo "Cleaning up port-forwards..."
  for pid in "${PF_PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  echo "Done."
}
trap cleanup EXIT

resolve_ingress_host() {
  case "$NAMESPACE" in
    staging)    echo "$INGRESS_HOSTS_STAGING" ;;
    production) echo "$INGRESS_HOSTS_PRODUCTION" ;;
    *)          echo "$INGRESS_HOSTS_DEV" ;;
  esac
}

INGRESS_HOST=$(resolve_ingress_host)

echo "============================================"
echo "  K8s Gateway Load Tests"
echo "============================================"
echo ""
echo "  Namespace:  $NAMESPACE"
echo "  Ingress:    $INGRESS_SVC ($INGRESS_NS)"
echo "  Host:       $INGRESS_HOST"
echo "  Local port: $INGRESS_LOCAL_PORT"
echo ""

echo "Port-forwarding ingress controller ($INGRESS_LOCAL_PORT -> 80)..."
kubectl port-forward "svc/$INGRESS_SVC" "${INGRESS_LOCAL_PORT}:80" -n "$INGRESS_NS" &
PF_PIDS+=($!)

echo "Waiting for ingress to be reachable..."
sleep 3

for i in $(seq 1 30); do
  if curl -sf -H "Host: $INGRESS_HOST" "http://localhost:${INGRESS_LOCAL_PORT}/api/health" > /dev/null 2>&1; then
    echo "Gateway is reachable via ingress."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Gateway not reachable after 30 attempts."
    exit 1
  fi
  sleep 2
done

export BACKEND_URL="http://localhost:${INGRESS_LOCAL_PORT}"
export FRAUD_URL="http://localhost:${INGRESS_LOCAL_PORT}"
export NOTIFICATION_URL="http://localhost:${INGRESS_LOCAL_PORT}"
export SIEGE_HEADER="Host: ${INGRESS_HOST}"
export GATEWAY_MODE="true"

exec "$SCRIPT_DIR/run-load-tests.sh"
