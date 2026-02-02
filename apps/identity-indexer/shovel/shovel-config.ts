import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import shovelConfig from "@indexsupply/shovel-config";
import { shovelIntegrations } from "./shovel-integrations.js";
import { env } from "../src/env.js";
import type { EnvVars } from "./shovel-types.js";
import {
  buildEventIntegration,
  buildShovelSource,
  readDeployAddress,
} from "./shovel-utils.js";

function parseArgs(argv: string[] = process.argv.slice(2)): string[] {
  if (argv[0] === "--") return argv.slice(1);
  return argv;
}

export function buildShovelConfig(env: EnvVars): string {
  const source = buildShovelSource(env);
  const integrations = shovelIntegrations.map((contract) => {
    const registryAddress = readDeployAddress({
      chainId: env.CHAIN_ID,
      contractName: contract.contractName,
    });
    return buildEventIntegration({
      contract,
      registryAddress,
      startBlock: env.SHOVEL_START_BLOCK,
      sourceName: source.name,
    });
  });

  const config = shovelConfig.makeConfig({
    pg_url: env.DATABASE_URL,
    sources: [source],
    integrations,
  });

  return shovelConfig.toJSON(config, 2);
}

export function writeShovelConfig(env: EnvVars, outputFile: string): void {
  const configJson = buildShovelConfig(env);
  writeFileSync(resolve(outputFile), configJson + "\n");
}

async function main(): Promise<void> {
  const [outputFile] = parseArgs();
  if (!outputFile) {
    throw new Error("Usage: shovel-config.ts <output>");
  }

  if (shovelIntegrations.length === 0) {
    throw new Error("No shovel integrations configured.");
  }

  writeShovelConfig(env, outputFile);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
