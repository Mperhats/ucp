#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
env_file="${2:-}"

if [[ -z "$compose_file" || -z "$env_file" ]]; then
  echo "Usage: $0 <compose-file> <env-file>"
  exit 1
fi

docker compose --env-file "$env_file" -f "$compose_file" run --no-deps --rm foundry \
  "cd /repo/contracts/erc8004 && forge build"
