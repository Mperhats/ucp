import {
  AgentUriZodSchema as AgentUriSchema,
  EndpointElementSchema,
  type AgentUriZod,
} from "@ucp/erc8004-specs";

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function requireUcpEndpoint(agentUri: AgentUriZod) {
  const endpoint = agentUri.endpoints.find((entry) => entry.name === "UCP");
  if (!endpoint) {
    throw new Error("Missing UCP endpoint in agentURI");
  }
  return EndpointElementSchema.parse(endpoint);
}

export async function resolveAgentUri(
  agentUri: string,
  timeoutMs: number
): Promise<AgentUriZod> {
  const payload = await fetchJson(agentUri, timeoutMs);
  const parsed = AgentUriSchema.parse(payload);
  requireUcpEndpoint(parsed);
  return parsed;
}
