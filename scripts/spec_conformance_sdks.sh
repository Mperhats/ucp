#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[spec] generating TypeScript schema types"
pnpm -C "${ROOT_DIR}/spec" install
pnpm run generate:ts

echo "[sdk] generating Python SDK"
"${ROOT_DIR}/scripts/python_sdk_build.sh" "${ROOT_DIR}/spec"

echo "[conformance] running tests against sample server"
"${ROOT_DIR}/scripts/run_conformance.sh" \
  "/tmp/ucp_test/products.db" \
  "/tmp/ucp_test/transactions.db" \
  "${ROOT_DIR}/apps/samples" \
  "${ROOT_DIR}/packages/conformance" \
  "${ROOT_DIR}/packages/python-sdk"

echo "[sdk] generating and building JS SDK"
"${ROOT_DIR}/scripts/js_sdk_build.sh" "${ROOT_DIR}/spec"
