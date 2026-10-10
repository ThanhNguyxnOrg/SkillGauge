#!/bin/sh
# Verifier: run pytest, write reward.txt (1/0), always exit 0.
set -u
OUT_DIR="${PILOT_WORK_DIR:-/work}"
LOG_DIR="${PILOT_LOG_DIR:-/logs/verifier}"
mkdir -p "$LOG_DIR"
if python -m pytest "$(dirname "$0")/test_outputs.py" > "$LOG_DIR/output.txt" 2>&1; then
  echo 1 > "$LOG_DIR/reward.txt"
else
  echo 0 > "$LOG_DIR/reward.txt"
fi
exit 0
