#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
env_file="${2:-}"
rpc_url="${3:-}"
deployer_key="${4:-}"

if [[ -z "$compose_file" || -z "$env_file" || -z "$rpc_url" || -z "$deployer_key" ]]; then
  echo "Usage: $0 <compose-file> <env-file> <rpc-url> <deployer-key>"
  exit 1
fi

deployer_address="$(docker compose --env-file "$env_file" -f "$compose_file" run --rm \
  foundry "cast wallet address $deployer_key")"

docker compose --env-file "$env_file" -f "$compose_file" run --rm \
  -e DEPLOYER_PRIVATE_KEY="$deployer_key" \
  foundry "cd /repo/contracts/vendor/commerce-payments && \
  forge script script/Deploy.s.sol:Deploy \
  --rpc-url $rpc_url --broadcast --sender $deployer_address --private-key $deployer_key"
