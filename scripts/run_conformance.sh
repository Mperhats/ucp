#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${SCRIPT_DIR}/lib/uv.sh"

function wait_for_server() {
  local url="$1"
  local retries=30

  for _ in $(seq 1 "${retries}"); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Error: server did not become ready at ${url}" >&2
  return 1
}

function find_free_port() {
  python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("", 0))
port = s.getsockname()[1]
s.close()
print(port)
PY
}

PRODUCTS_DB="${1:?products db path}"
TX_DB="${2:?tx db path}"
SAMPLES_DIR="${3:?samples dir}"
CONFORMANCE_DIR="${4:?conformance dir}"
PY_SDK_DIR="${5:?python sdk dir}"

UCP_TEST_DIR="$(dirname "${PRODUCTS_DB}")"
SIMULATION_SECRET="super-secret-sim-key"
MERCHANT_SERVER_PORT="$(find_free_port)"
SERVER_URL="http://localhost:${MERCHANT_SERVER_PORT}"
CONFORMANCE_INPUT="${CONFORMANCE_DIR}/test_data/flower_shop/conformance_input.json"
UV_BIN="$(resolve_uv)"

rm -rf "${UCP_TEST_DIR}"
mkdir -p "${UCP_TEST_DIR}"

# Path dependencies are configured to point at packages/python-sdk.

uv_sync_or_install "${CONFORMANCE_DIR}" "${UV_BIN}"
uv_sync_or_install "${SAMPLES_DIR}/rest/python/server" "${UV_BIN}"
uv_sync_or_install "${PY_SDK_DIR}" "${UV_BIN}"

# initialize db using sample importer (conformance provides test data)
(cd "${SAMPLES_DIR}/rest/python/server" && "${UV_BIN}" run import_csv.py \
  --products_db_path="${PRODUCTS_DB}" \
  --transactions_db_path="${TX_DB}" \
  --data_dir="${CONFORMANCE_DIR}/test_data/flower_shop")

# run server in background
(
  export SIMULATION_SECRET="${SIMULATION_SECRET}"
  export MERCHANT_SERVER_PORT="${MERCHANT_SERVER_PORT}"
  cd "${SAMPLES_DIR}/rest/python/server"
  "${UV_BIN}" run server.py \
  --products_db_path="${PRODUCTS_DB}" \
  --transactions_db_path="${TX_DB}" \
  --port="${MERCHANT_SERVER_PORT}" \
  --simulation_secret="${SIMULATION_SECRET}"
) &
SERVER_PID=$!

cleanup() { kill "${SERVER_PID}" 2>/dev/null || true; }
trap cleanup EXIT

wait_for_server "http://localhost:${MERCHANT_SERVER_PORT}/.well-known/ucp"
if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
  echo "Error: sample server exited before tests started." >&2
  exit 1
fi

# run tests (absltest based; invoke each file)
shopt -s nullglob
for test_file in "${CONFORMANCE_DIR}"/*_test.py; do
  (cd "${CONFORMANCE_DIR}" && "${UV_BIN}" run "${test_file}" \
    --server_url="${SERVER_URL}" \
    --simulation_secret="${SIMULATION_SECRET}" \
    --conformance_input="${CONFORMANCE_INPUT}")
done
