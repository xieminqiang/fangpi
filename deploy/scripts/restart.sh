#!/bin/bash
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_DIR"

if [ ! -f "./server" ]; then
  echo "error: server binary not found in ${DEPLOY_DIR}"
  exit 1
fi

chmod +x ./server

if pgrep -f "${DEPLOY_DIR}/server" > /dev/null 2>&1; then
  pkill -f "${DEPLOY_DIR}/server" || true
  sleep 2
fi

CONFIG_FILE="${CONFIG_FILE:-config.yaml}"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "warning: ${CONFIG_FILE} not found, starting with default config"
  nohup ./server > server.log 2>&1 &
else
  nohup ./server -c "$CONFIG_FILE" > server.log 2>&1 &
fi

echo "server restarted, pid: $(pgrep -f "${DEPLOY_DIR}/server" || echo unknown)"
