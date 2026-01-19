import type { Context } from "hono";
import type { Kysely } from "kysely";
import type { IndexerDb } from "../db.js";
import type { AppEnv } from "../env.js";
import type {
  AgentIdParams,
  ListAgentsQuery,
} from "../utils/validation.js";
import {
  buildAgentDetail,
  buildAgentListingItem,
  buildHostedAgentUri,
  toApiAgent,
} from "./agents.js";
import { buildAgentUrls, buildHostedUrlsFromAgentUri } from "./agent-urls.js";
import {
  getIndexedAgent,
  getIndexedAgentByHost,
  listIndexedAgents,
} from "../db.js";
import { resolveHostFromHeader } from "./agent-host.js";

interface AgentsHandlersArgs {
  db: Kysely<IndexerDb>;
  env: AppEnv;
}

function resolveOrigin(url: string): { origin: string; protocol: string } {
  const parsed = new URL(url);
  return { origin: parsed.origin, protocol: parsed.protocol };
}

function notFound(message: string) {
  return { error: message };
}

export function createAgentsHandlers(args: AgentsHandlersArgs) {
  const hostBase = args.env.INDEXER_AGENT_HOST_BASE;
  const apiPort = args.env.INDEXER_API_PORT;

  function requireValid<T>(
    c: Context,
    target: "query" | "param"
  ): T {
    return (c.req as any).valid(target) as T;
  }

  return {
    async listAgents(c: Context): Promise<Response> {
      const { origin, protocol } = resolveOrigin(c.req.url);
      const { limit } = requireValid<ListAgentsQuery>(c, "query");
      const agents = await listIndexedAgents(args.db, limit);
      const items = agents.map((agent) => {
        const apiAgent = toApiAgent(agent);
        const urls = buildAgentUrls({
          origin,
          protocol,
          agentId: apiAgent.agentId,
          hostBase,
          port: apiPort,
        });
        const hostedUrls =
          buildHostedUrlsFromAgentUri(apiAgent.agentUri) ?? null;
        return buildAgentListingItem(apiAgent, {
          agentUriUrl: urls.agentUriUrl,
          ucpProfileUrl: urls.ucpProfileUrl,
          hostedAgentUriUrl:
            hostedUrls?.hostedAgentUriUrl ?? urls.hostedAgentUriUrl,
          hostedUcpProfileUrl:
            hostedUrls?.hostedUcpProfileUrl ?? urls.hostedUcpProfileUrl,
        });
      });
      return c.json({ agents: items });
    },
    async getAgent(c: Context): Promise<Response> {
      const { origin, protocol } = resolveOrigin(c.req.url);
      const { agentId } = requireValid<AgentIdParams>(c, "param");
      const storedAgent = await getIndexedAgent(args.db, agentId);
      if (!storedAgent) return c.json(notFound("Agent Not Found"), 404);
      const agent = toApiAgent(storedAgent);
      const urls = buildAgentUrls({
        origin,
        protocol,
        agentId: agent.agentId,
        hostBase,
        port: apiPort,
      });
      const hostedUrls = buildHostedUrlsFromAgentUri(agent.agentUri);
      const resolvedUrls = {
        agentUriUrl: urls.agentUriUrl,
        ucpProfileUrl: urls.ucpProfileUrl,
        hostedAgentUriUrl:
          hostedUrls?.hostedAgentUriUrl ?? urls.hostedAgentUriUrl,
        hostedUcpProfileUrl:
          hostedUrls?.hostedUcpProfileUrl ?? urls.hostedUcpProfileUrl,
      };
      return c.json(buildAgentDetail(agent, resolvedUrls));
    },
    async getAgentUri(c: Context): Promise<Response> {
      const { origin, protocol } = resolveOrigin(c.req.url);
      const { agentId } = requireValid<AgentIdParams>(c, "param");
      const storedAgent = await getIndexedAgent(args.db, agentId);
      
      if (!storedAgent) return c.json(notFound("Agent Not Found"), 404);
      const agent = toApiAgent(storedAgent);
      if (!agent.agentUriJson) {
        return c.json(notFound("Agent URI Not Found"), 404);
      }
      const urls = buildAgentUrls({
        origin,
        protocol,
        agentId: agent.agentId,
        hostBase,
        port: apiPort,
      });
      return c.json(buildHostedAgentUri(agent.agentUriJson, urls.ucpProfileUrl));
    },
    async getHostedAgentUri(c: Context): Promise<Response> {
      const host = resolveHostFromHeader(c.req.header("host"));
      if (!host) return c.json(notFound("Agent Not Found"), 404);
      const storedAgent = await getIndexedAgentByHost(args.db, host);
      if (!storedAgent) return c.json(notFound("Agent Not Found"), 404);
      const agent = toApiAgent(storedAgent);
      if (!agent.agentUriJson) {
        return c.json(notFound("Agent URI Not Found"), 404);
      }
      const { origin } = resolveOrigin(c.req.url);
      return c.json(
        buildHostedAgentUri(agent.agentUriJson, `${origin}/.well-known/ucp`)
      );
    },
  };
}
