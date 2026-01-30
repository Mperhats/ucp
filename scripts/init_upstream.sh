#!/usr/bin/env bash
set -euo pipefail

if [ -f .gitmodules ]; then
  echo "[init] initializing submodules"
  git submodule update --init --recursive
else
  echo "[init] no .gitmodules found; assuming subtrees or already vendored"
fi
