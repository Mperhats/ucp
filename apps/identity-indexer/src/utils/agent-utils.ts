import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import type { AppEnv } from "../env.js";
import { buildAgentUrls } from "./agent-url-utils.js";

export function buildAgentHostUrls(args: { agentId: string; env: AppEnv }) {
  const origin = `http://${args.env.INDEXER_AGENT_HOST_BASE}:${args.env.INDEXER_AGENT_PROXY_PORT}`;
  return buildAgentUrls({
    origin,
    protocol: "http",
    agentId: args.agentId,
    hostBase: args.env.INDEXER_AGENT_HOST_BASE,
    port: args.env.INDEXER_API_PORT,
  });
}

export function buildHostedAgentUri(
  baseAgentUri: AgentUriZod,
  ucpProfileUrl: string
): AgentUriZod {
  function rewriteUcpEndpoint(endpoint: AgentUriZod["endpoints"][number]) {
    if (endpoint.name !== "UCP") return endpoint;
    return {
      ...endpoint,
      endpoint: ucpProfileUrl,
    };
  }

  const nextEndpoints = baseAgentUri.endpoints.map(rewriteUcpEndpoint);
  return AgentUriZodSchema.parse({
    ...baseAgentUri,
    endpoints: nextEndpoints,
  });
}
