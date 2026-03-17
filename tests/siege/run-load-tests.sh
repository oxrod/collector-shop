#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SIEGE_CONF="$SCRIPT_DIR/siege.conf"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

BASELINE_CONCURRENT="${BASELINE_CONCURRENT:-25}"
BASELINE_TIME="${BASELINE_TIME:-60S}"
LOAD_CONCURRENT="${LOAD_CONCURRENT:-100}"
LOAD_TIME="${LOAD_TIME:-120S}"
STRESS_CONCURRENT="${STRESS_CONCURRENT:-250}"
STRESS_TIME="${STRESS_TIME:-60S}"
MICRO_CONCURRENT="${MICRO_CONCURRENT:-50}"
MICRO_TIME="${MICRO_TIME:-60S}"

mkdir -p "$RESULTS_DIR"

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

  print_header "$name — ${concurrent} concurrent users / ${duration}"

  siege \
    --rc="$SIEGE_CONF" \
    -c "$concurrent" \
    -t "$duration" \
    -f "$urls_file" \
    --log="$log_file" \
    2>&1 | tee "$RESULTS_DIR/${name}_${TIMESTAMP}_output.txt"

  echo ""
  echo "Results saved to: $log_file"
}

print_header "Collector Shop — Siege Load Tests"
echo "Timestamp: $TIMESTAMP"
echo "Results directory: $RESULTS_DIR"

run_scenario "baseline" "$BASELINE_CONCURRENT" "$BASELINE_TIME" "$SCRIPT_DIR/urls-public.txt"

run_scenario "load" "$LOAD_CONCURRENT" "$LOAD_TIME" "$SCRIPT_DIR/urls-public.txt"

run_scenario "stress" "$STRESS_CONCURRENT" "$STRESS_TIME" "$SCRIPT_DIR/urls-stress.txt"

if curl -sf http://localhost:3002/health > /dev/null 2>&1; then
  run_scenario "microservices" "$MICRO_CONCURRENT" "$MICRO_TIME" "$SCRIPT_DIR/urls-microservices.txt"
else
  echo ""
  echo "[SKIP] Microservices not reachable — skipping microservices scenario"
fi

print_header "All scenarios completed"
echo "Results in: $RESULTS_DIR"
echo ""
ls -lh "$RESULTS_DIR"/*"$TIMESTAMP"* 2>/dev/null || echo "No result files found."
