import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import type { IndexedAgentRecord, Json } from "../db.js";

export interface ApiAgent {
  chainId: number;
  agentId: string;
  agentUri: string;
  agentUriJson: AgentUriZod | null;
  registry: Buffer;
  owner: Buffer;
}

export interface AgentListingItem {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  agentUriUrl: string;
  ucpProfileUrl: string;
  hostedAgentUriUrl: string;
  hostedUcpProfileUrl: string;
}

export interface AgentDetail extends AgentListingItem {
  agentUri: string;
}

interface AgentUrls {
  agentUriUrl: string;
  ucpProfileUrl: string;
  hostedAgentUriUrl: string;
  hostedUcpProfileUrl: string;
}

function parseAgentUriJson(raw: Json | null): AgentUriZod | null {
  if (!raw) return null;
  const parsed = AgentUriZodSchema.safeParse(raw);
  if (!parsed.success) return null;
  return parsed.data;
}

function extractAgentMetadata(agentUriJson: AgentUriZod | null): {
  name?: string;
  description?: string;
  imageUrl?: string;
} {
  if (!agentUriJson) return {};
  return {
    name: agentUriJson.name,
    description: agentUriJson.description,
    imageUrl: agentUriJson.image,
  };
}

export function buildHostedAgentUri(
  baseAgentUri: AgentUriZod,
  ucpProfileUrl: string
): AgentUriZod {
  let hasUcpEndpoint = false;
  const nextEndpoints = baseAgentUri.endpoints.map((endpoint) => {
    if (endpoint.name !== "UCP") return endpoint;
    hasUcpEndpoint = true;
    return {
      ...endpoint,
      endpoint: ucpProfileUrl,
    };
  });
  if (!hasUcpEndpoint) {
    nextEndpoints.push({ name: "UCP", endpoint: ucpProfileUrl });
  }
  return AgentUriZodSchema.parse({
    ...baseAgentUri,
    endpoints: nextEndpoints,
  });
}

export function buildAgentListingItem(
  agent: ApiAgent,
  urls: AgentUrls
): AgentListingItem {
  return {
    id: agent.agentId,
    ...extractAgentMetadata(agent.agentUriJson),
    agentUriUrl: urls.agentUriUrl,
    ucpProfileUrl: urls.ucpProfileUrl,
    hostedAgentUriUrl: urls.hostedAgentUriUrl,
    hostedUcpProfileUrl: urls.hostedUcpProfileUrl,
  };
}

export function buildAgentDetail(
  agent: ApiAgent,
  urls: AgentUrls
): AgentDetail {
  return {
    ...buildAgentListingItem(agent, urls),
    agentUri: agent.agentUri,
  };
}

export function toApiAgent(record: IndexedAgentRecord): ApiAgent {
  return {
    chainId: record.chainId,
    agentId: record.agentId,
    agentUri: record.agentUri,
    agentUriJson: parseAgentUriJson(record.agentUriJson),
    registry: record.registry,
    owner: record.owner,
  };
}
