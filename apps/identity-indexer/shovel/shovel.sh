#!/usr/bin/env bash
set -euo pipefail

COMMAND="${1:-up}"

if [[ "$COMMAND" != "up" && "$COMMAND" != "down" && "$COMMAND" != "logs" ]]; then
  echo "Usage: shovel.sh <up|down|logs>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
APP_DIR="${ROOT_DIR}/apps/identity-indexer"
SHOVEL_DIR="${APP_DIR}/shovel"

ROOT_ENV="${ROOT_DIR}/.env"
APP_ENV="${APP_DIR}/.env.local"

if [[ ! -f "${ROOT_ENV}" ]]; then
  echo "Missing .env at repo root. Run: make env-init"
  exit 1
fi

ENV_ARGS=(--env-file "${ROOT_ENV}")
if [[ -f "${APP_ENV}" ]]; then
  ENV_ARGS+=(--env-file "${APP_ENV}")
else
  echo "Missing ${APP_ENV}. Create it from .env.local.example."
fi

COMPOSE_FILES=(
  -f "${ROOT_DIR}/infra/docker-compose.yml"
  -f "${APP_DIR}/shovel/docker-compose.yml"
)

if [[ "$COMMAND" == "logs" ]]; then
  SHOVEL_DIR="${SHOVEL_DIR}" docker compose \
    "${ENV_ARGS[@]}" \
    "${COMPOSE_FILES[@]}" \
    logs -f shovel
  exit 0
fi

SHOVEL_DIR="${SHOVEL_DIR}" docker compose \
  "${ENV_ARGS[@]}" \
  "${COMPOSE_FILES[@]}" \
  "${COMMAND}" -d shovel
