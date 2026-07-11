#!/bin/bash
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_DIR"
CONFIG_FILE="${CONFIG_FILE:-config.yaml}"
PID_FILE="${DEPLOY_DIR}/server.pid"

if [ ! -f "./server" ]; then
  echo "error: server binary not found in ${DEPLOY_DIR}"
  echo "hint: push main branch to trigger GitHub Actions deploy"
  exit 1
fi

chmod +x ./server

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  kill "$(cat "$PID_FILE")" || true
  sleep 2
fi

if pgrep -f "${DEPLOY_DIR}/server" > /dev/null 2>&1; then
  pkill -f "${DEPLOY_DIR}/server" || true
  sleep 2
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "warning: ${CONFIG_FILE} not found, starting with default config"
  nohup ./server > server.log 2>&1 &
else
  nohup ./server -c "$CONFIG_FILE" > server.log 2>&1 &
fi

echo $! > "$PID_FILE"
sleep 2

if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "server restarted, pid: $(cat "$PID_FILE")"
  exit 0
fi

echo "error: server failed to start"
echo "----- server.log -----"
tail -50 server.log 2>/dev/null || echo "(log empty)"
exit 1
