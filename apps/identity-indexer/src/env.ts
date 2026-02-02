import { loadEnvFiles } from "@ucp/config/env";
import { appRootFromCwd, repoRoot } from "@ucp/config/path";
import { AppEnvSchema, type AppEnv } from "./_generated/env.js";

const repoRootDir = repoRoot();
const appRoot = appRootFromCwd({ appPath: "apps/identity-indexer" });
loadEnvFiles({ repoRoot: repoRootDir, appRoot });

export const env: AppEnv = AppEnvSchema.parse(process.env);
export type { AppEnv };