import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { findRepoRoot } from "./repo-root.js";

export function dirnameFromUrl(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}

export function repoRootFromUrl(
  importMetaUrl: string,
  options: Omit<findRepoRoot.Options, "from"> = {},
): findRepoRoot.ReturnType {
  return findRepoRoot({ from: dirnameFromUrl(importMetaUrl), ...options });
}

export function appRootFromUrl(importMetaUrl: string, up: number = 1): string {
  let dir = dirnameFromUrl(importMetaUrl);
  for (let i = 0; i < up; i++) dir = resolve(dir, "..");
  return dir;
}
