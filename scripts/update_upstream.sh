#!/usr/bin/env bash
set -euo pipefail

if [ -f .gitmodules ]; then
  echo "[update] submodules: fetching remote heads and updating"
  git submodule update --remote --merge
  git status --porcelain
  exit 0
fi

echo "[update] subtrees: pulling latest upstream"
git subtree pull --prefix packages/js-sdk https://github.com/Universal-Commerce-Protocol/js-sdk main --squash
git subtree pull --prefix packages/python-sdk https://github.com/Universal-Commerce-Protocol/python-sdk main --squash
git subtree pull --prefix packages/conformance https://github.com/Universal-Commerce-Protocol/conformance main --squash
git subtree pull --prefix apps/samples https://github.com/Universal-Commerce-Protocol/samples main --squash
