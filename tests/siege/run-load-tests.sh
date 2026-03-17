#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SIEGE_CONF="$SCRIPT_DIR/siege.conf"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRAUD_URL="${FRAUD_URL:-http://localhost:3002}"
NOTIFICATION_URL="${NOTIFICATION_URL:-http://localhost:3003}"
SIEGE_HEADER="${SIEGE_HEADER:-}"
GATEWAY_MODE="${GATEWAY_MODE:-false}"

BASELINE_CONCURRENT="${BASELINE_CONCURRENT:-25}"
BASELINE_TIME="${BASELINE_TIME:-60S}"
LOAD_CONCURRENT="${LOAD_CONCURRENT:-100}"
LOAD_TIME="${LOAD_TIME:-120S}"
STRESS_CONCURRENT="${STRESS_CONCURRENT:-250}"
STRESS_TIME="${STRESS_TIME:-60S}"
MICRO_CONCURRENT="${MICRO_CONCURRENT:-50}"
MICRO_TIME="${MICRO_TIME:-60S}"

mkdir -p "$RESULTS_DIR"

generate_urls() {
  if [ "$GATEWAY_MODE" = "true" ]; then
    cat > "$RESULTS_DIR/urls-public-gen.txt" <<EOF
${BACKEND_URL}/
${BACKEND_URL}/api/health
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/categories
${BACKEND_URL}/api/shops
${BACKEND_URL}/api/metrics
${BACKEND_URL}/auth
EOF

    cat > "$RESULTS_DIR/urls-stress-gen.txt" <<EOF
${BACKEND_URL}/
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/categories
${BACKEND_URL}/api/shops
${BACKEND_URL}/auth
EOF
  else
    cat > "$RESULTS_DIR/urls-public-gen.txt" <<EOF
${BACKEND_URL}/api/health
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/categories
${BACKEND_URL}/api/shops
${BACKEND_URL}/api/metrics
EOF

    cat > "$RESULTS_DIR/urls-stress-gen.txt" <<EOF
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/articles
${BACKEND_URL}/api/categories
EOF
  fi

  cat > "$RESULTS_DIR/urls-microservices-gen.txt" <<EOF
${FRAUD_URL}/health
${NOTIFICATION_URL}/health
${FRAUD_URL}/metrics
${NOTIFICATION_URL}/metrics
EOF
}

print_header() {
  echo ""
  echo "============================================"
  echo "  $1"
  echo "============================================"
  echo ""
}

run_scenario() {
  local name="$1"
  local concurrent="$2"
  local duration="$3"
  local urls_file="$4"
  local log_file="$RESULTS_DIR/${name}_${TIMESTAMP}.log"
  local header_args=()

  if [ -n "$SIEGE_HEADER" ]; then
    header_args=(--header="$SIEGE_HEADER")
  fi

  print_header "$name — ${concurrent} concurrent users / ${duration}"

  siege \
    --rc="$SIEGE_CONF" \
    -c "$concurrent" \
    -t "$duration" \
    -f "$urls_file" \
    --log="$log_file" \
    "${header_args[@]+"${header_args[@]}"}" \
    2>&1 | tee "$RESULTS_DIR/${name}_${TIMESTAMP}_output.txt"

  echo ""
  echo "Results saved to: $log_file"
}

generate_urls

print_header "Collector Shop — Siege Load Tests"
echo "Timestamp: $TIMESTAMP"
echo "Target:    $BACKEND_URL"
[ -n "$SIEGE_HEADER" ] && echo "Header:    $SIEGE_HEADER"
[ "$GATEWAY_MODE" = "true" ] && echo "Mode:      GATEWAY (full infrastructure)"
echo "Results:   $RESULTS_DIR"

PUBLIC_URLS="$RESULTS_DIR/urls-public-gen.txt"
STRESS_URLS="$RESULTS_DIR/urls-stress-gen.txt"
MICRO_URLS="$RESULTS_DIR/urls-microservices-gen.txt"

run_scenario "baseline" "$BASELINE_CONCURRENT" "$BASELINE_TIME" "$PUBLIC_URLS"

run_scenario "load" "$LOAD_CONCURRENT" "$LOAD_TIME" "$PUBLIC_URLS"

run_scenario "stress" "$STRESS_CONCURRENT" "$STRESS_TIME" "$STRESS_URLS"

if curl -sf "${FRAUD_URL}/health" > /dev/null 2>&1; then
  run_scenario "microservices" "$MICRO_CONCURRENT" "$MICRO_TIME" "$MICRO_URLS"
else
  echo ""
  echo "[SKIP] Microservices not reachable — skipping microservices scenario"
fi

print_header "All scenarios completed"
echo "Results in: $RESULTS_DIR"
echo ""
ls -lh "$RESULTS_DIR"/*"$TIMESTAMP"* 2>/dev/null || echo "No result files found."
