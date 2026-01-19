import type { Context } from "hono";
import type { Kysely } from "kysely";
import type { IndexerDb } from "../db.js";
import type { AppEnv } from "../env.js";
import { getIndexedAgent, getIndexedAgentByHost } from "../db.js";
import { resolveHostFromHeader } from "./agent-host.js";
import { buildDiscoveryProfile, DEFAULT_UCP_VERSION } from "./discovery.js";
import { toApiAgent } from "./agents.js";

interface DiscoveryHandlersArgs {
  db: Kysely<IndexerDb>;
  env: AppEnv;
}

function resolveOrigin(url: string): { origin: string } {
  const parsed = new URL(url);
  return { origin: parsed.origin };
}

function resolveEndpointBase(args: {
  origin: string;
  agentId: string;
  hostMatched: boolean;
}): string {
  if (args.hostMatched) return args.origin;
  return `${args.origin}/agents/${args.agentId}`;
}

function notFound(message: string) {
  return { error: message };
}

export function createDiscoveryHandlers(args: DiscoveryHandlersArgs) {
  const ucpVersion = args.env.INDEXER_UCP_VERSION ?? DEFAULT_UCP_VERSION;

  return {
    async getAgentDiscovery(c: Context): Promise<Response> {
      const { origin } = resolveOrigin(c.req.url);
      const { agentId } = c.req.valid("param");
      const storedAgent = await getIndexedAgent(args.db, agentId);
      if (!storedAgent) return c.json(notFound("Agent Not Found"), 404);
      const agent = toApiAgent(storedAgent);
      const endpointBase = resolveEndpointBase({
        origin,
        agentId: agent.agentId,
        hostMatched: false,
      });
      return c.json(
        buildDiscoveryProfile({
          ucpVersion,
          endpointBase,
        })
      );
    },
    async getHostedDiscovery(c: Context): Promise<Response> {
      const host = resolveHostFromHeader(c.req.header("host"));
      if (!host) return c.json(notFound("Agent Not Found"), 404);
      const storedAgent = await getIndexedAgentByHost(args.db, host);
      if (!storedAgent) return c.json(notFound("Agent Not Found"), 404);
      const agent = toApiAgent(storedAgent);
      const { origin } = resolveOrigin(c.req.url);
      const endpointBase = resolveEndpointBase({
        origin,
        agentId: agent.agentId,
        hostMatched: true,
      });
      return c.json(
        buildDiscoveryProfile({
          ucpVersion,
          endpointBase,
        })
      );
    },
  };
}
