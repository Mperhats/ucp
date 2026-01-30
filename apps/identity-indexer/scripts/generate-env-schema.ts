import { resolve } from "node:path";

import { generateEnvSchemaFromTemplates } from "@ucp/config/env";
import { appRootFromCwd, repoRoot } from "@ucp/config/path";

const repoRootDir = repoRoot();
const appRoot = appRootFromCwd({ appPath: "apps/identity-indexer" });

generateEnvSchemaFromTemplates({
  templatePaths: [
    resolve(repoRootDir, ".env.template"),
    resolve(appRoot, ".env.local.example"),
  ],
  outputPath: resolve(appRoot, "src", "_generated", "env.ts"),
  schemaName: "AppEnvSchema",
  interfaceName: "AppEnv",
});
