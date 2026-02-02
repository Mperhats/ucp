import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { findUp } from "./find-up.js";

export function findRepoRoot(
  options: findRepoRoot.Options,
): findRepoRoot.ReturnType {
  const { marker = "pnpm-workspace.yaml", ...rest } = options;
  return findUp({ marker, ...rest });
}

export function repoRoot(options: repoRoot.Options = {}): repoRoot.ReturnType {
  const repoRoot = findRepoRoot({ from: process.cwd(), ...options });
  if (!repoRoot) {
    throw new Error("Could not find repo root from process.cwd().");
  }
  return repoRoot;
}

export function appRootFromCwd(
  options: appRootFromCwd.Options,
): appRootFromCwd.ReturnType {
  const repoRootDir = repoRoot();
  const appRoot = resolve(repoRootDir, options.appPath);
  if (!existsSync(resolve(appRoot, "package.json"))) {
    throw new Error(`Could not find app root at "${appRoot}".`);
  }
  return appRoot;
}

export namespace findRepoRoot {
  export interface Options extends Omit<findUp.Options, "marker"> {
    marker?: string;
  }

  export type ReturnType = findUp.ReturnType;
}

export namespace repoRoot {
  export type Options = Omit<findRepoRoot.Options, "from">;
  export type ReturnType = string;
}

export namespace appRootFromCwd {
  export interface Options {
    appPath: string;
  }

  export type ReturnType = string;
}
