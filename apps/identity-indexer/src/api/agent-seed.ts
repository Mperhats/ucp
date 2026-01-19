import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import { z } from "zod";
import { buildDiscoveryProfile, DEFAULT_UCP_VERSION } from "./discovery.js";

const SeedSchema = z.object({
  agentUri: z.string().url(),
  agentUriJson: AgentUriZodSchema,
});

interface AgentSeed {
  agentUri: string;
  agentUriJson: AgentUriZod;
}

function normalizeAgentUri(agentUri: string): string {
  return agentUri.trim();
}

function safeParseSeed(
  input: unknown
): AgentSeed | null {
  const parsed = SeedSchema.safeParse(input);
  if (!parsed.success) return null;
  return parsed.data;
}

const seedStore = new Map<string, AgentSeed>();

export function registerAgentSeed(seed: AgentSeed): void {
  const key = normalizeAgentUri(seed.agentUri);
  seedStore.set(key, seed);
}

export function getAgentSeed(agentUri: string): AgentSeed | null {
  const key = normalizeAgentUri(agentUri);
  return seedStore.get(key) ?? null;
}

export function maybeSeedFromPayload(payload: unknown): AgentSeed | null {
  return safeParseSeed(payload);
}

export function buildSeedDiscovery(args: {
  ucpVersion?: string;
  origin: string;
}): ReturnType<typeof buildDiscoveryProfile> {
  return buildDiscoveryProfile({
    ucpVersion: args.ucpVersion ?? DEFAULT_UCP_VERSION,
    endpointBase: args.origin,
  });
}
