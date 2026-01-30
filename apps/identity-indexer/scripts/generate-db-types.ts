import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { config as loadEnv } from "dotenv";
import { appRootFromCwd, repoRoot } from "@ucp/config/path";

const repoRootDir = repoRoot();
const appRoot = appRootFromCwd({ appPath: "apps/identity-indexer" });

loadEnv({ path: resolve(repoRootDir, ".env") });
loadEnv({ path: resolve(appRoot, ".env.local"), override: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Set it in .env.local.");
}

function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "postgres") {
      parsed.hostname = "127.0.0.1";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const resolvedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);

const result = spawnSync(
  "kysely-codegen",
  [
    "--dialect",
    "postgres",
    "--url",
    resolvedDatabaseUrl,
    "--out-file",
    "src/_generated/db-types.ts",
  ],
  { stdio: "inherit" },
);

if (result.status !== 0) process.exit(result.status ?? 1);
