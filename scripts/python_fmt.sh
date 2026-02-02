#!/usr/bin/env bash
set -euo pipefail

if [ -d py ]; then
  (cd py && ruff check . && ruff format .)
fi
