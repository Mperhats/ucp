#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/lib/uv.sh"

PRODUCTS_DB="${1:?products db path}"
TX_DB="${2:?tx db path}"
UV_BIN="$(resolve_uv)"

uv_sync_or_install "apps/samples/rest/python/server" "${UV_BIN}"

# NOTE: you may need to import CSV first depending on the sample flow you choose.
(cd "apps/samples/rest/python/server" && "${UV_BIN}" run server.py \
  --products_db_path="${PRODUCTS_DB}" \
  --transactions_db_path="${TX_DB}" \
  --port=8182)
