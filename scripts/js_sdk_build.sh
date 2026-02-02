#!/usr/bin/env bash
set -euo pipefail

SPEC_DIR="${1:?spec dir required}"

cd packages/js-sdk
pnpm install --frozen-lockfile
# Generate models from your local spec directory
SPEC_INPUT_DIR="${SPEC_DIR}"
if [ -d "${SPEC_DIR}/spec/schemas" ] && [ -d "${SPEC_DIR}/spec/discovery" ]; then
  SPEC_INPUT_DIR="${SPEC_DIR}/spec"
fi

pnpm run generate -- "${SPEC_INPUT_DIR}"
pnpm run build
