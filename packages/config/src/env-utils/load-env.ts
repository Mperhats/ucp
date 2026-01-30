import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path: string, shouldOverride = false): void {
  if (!existsSync(path)) return;
  loadEnv({ path, override: shouldOverride });
}

export function loadEnvFiles(
  options: loadEnvFiles.Options,
): loadEnvFiles.ReturnType {
  const { repoRoot, appRoot } = options;
  loadEnvFile(resolve(repoRoot, ".env"));
  if (appRoot) loadEnvFile(resolve(appRoot, ".env.local"), true);
}

export namespace loadEnvFiles {
  export interface Options {
    repoRoot: string;
    appRoot?: string;
  }

  export type ReturnType = void;
}
