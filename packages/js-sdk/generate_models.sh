#!/bin/bash

if [[ -z "${1:-}" ]]; then
  echo "Error: spec directory path is required."
  echo "Usage: $0 <spec_dir>"
  echo "Example: pnpm run generate -- /path/to/spec"
  exit 1
fi

SPEC_DIR="$1"
if [[ "$SPEC_DIR" == "--" ]]; then
  SPEC_DIR="${2:-}"
fi

if [[ -z "$SPEC_DIR" ]]; then
  echo "Error: spec directory path is required."
  echo "Usage: $0 <spec_dir>"
  echo "Example: pnpm run generate -- /path/to/spec"
  exit 1
fi

SPEC_DIR="${SPEC_DIR%/}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

QUICKTYPE_SOURCES=()
while IFS= read -r line; do
  QUICKTYPE_SOURCES+=("$line")
done < <(node "${SCRIPT_DIR}/scripts/build_quicktype_sources.js" "${SPEC_DIR}")

QUICKTYPE_ARGS=(--lang typescript-zod --src-lang schema)
for src in "${QUICKTYPE_SOURCES[@]}"; do
  QUICKTYPE_ARGS+=(--src "${src}")
done
QUICKTYPE_ARGS+=(-o src/spec_generated.ts)

quicktype "${QUICKTYPE_ARGS[@]}"