#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/lib/uv.sh"

echo "[tooling] installing js-sdk deps (pnpm)"
if [ -d packages/js-sdk ]; then
  (cd packages/js-sdk && pnpm install --frozen-lockfile)
fi

UV_BIN="$(resolve_uv_optional)"

echo "[tooling] syncing python-sdk deps (uv)"
if [ -d packages/python-sdk ]; then
  uv_sync_or_install "packages/python-sdk" "${UV_BIN}"
fi

echo "[tooling] syncing conformance deps (uv)"
if [ -d packages/conformance ]; then
  uv_sync_or_install "packages/conformance" "${UV_BIN}"
fi

echo "[tooling] done"
