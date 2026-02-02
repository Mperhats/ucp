#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/lib/uv.sh"

SPEC_DIR="${1:?spec dir required}"
UV_BIN="$(resolve_uv)"

uv_sync_or_install "packages/python-sdk" "${UV_BIN}"
cd packages/python-sdk
export PATH="$(dirname "${UV_BIN}"):${PATH}"

# Ensure dev generator deps are present (datamodel-code-generator)
"${UV_BIN}" sync --group dev

# If python-sdk generator supports passing a spec path, pass it here.
# Otherwise, ensure your monorepo's spec path matches what upstream expects.
./generate_models.sh
if "${UV_BIN}" run python - <<'PY'
import importlib.util
raise SystemExit(0 if importlib.util.find_spec("pytest") else 1)
PY
then
  "${UV_BIN}" run pytest -q
fi
