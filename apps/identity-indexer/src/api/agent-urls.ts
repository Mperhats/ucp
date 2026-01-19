interface HostedOriginArgs {
  agentId: string;
  hostBase: string;
  port: number;
  protocol: string;
}

export interface AgentUrls {
  agentUriUrl: string;
  ucpProfileUrl: string;
  hostedAgentUriUrl: string;
  hostedUcpProfileUrl: string;
}

function normalizeProtocol(protocol: string): string {
  return protocol.endsWith(":") ? protocol : `${protocol}:`;
}

export function buildHostedOrigin(args: HostedOriginArgs): string {
  const normalizedProtocol = normalizeProtocol(args.protocol);
  const portSuffix = args.port === 80 || args.port === 443 ? "" : `:${args.port}`;
  return `${normalizedProtocol}//${args.agentId}.${args.hostBase}${portSuffix}`;
}

export function buildAgentUrls(args: {
  origin: string;
  protocol: string;
  agentId: string;
  hostBase: string;
  port: number;
}): AgentUrls {
  const hostedOrigin = buildHostedOrigin({
    agentId: args.agentId,
    hostBase: args.hostBase,
    port: args.port,
    protocol: args.protocol,
  });
  return {
    agentUriUrl: `${args.origin}/agents/${args.agentId}/agent-uri.json`,
    ucpProfileUrl: `${args.origin}/agents/${args.agentId}/.well-known/ucp`,
    hostedAgentUriUrl: `${hostedOrigin}/agent-uri.json`,
    hostedUcpProfileUrl: `${hostedOrigin}/.well-known/ucp`,
  };
}

export function buildHostedUrlsFromAgentUri(agentUri: string): {
  hostedAgentUriUrl: string;
  hostedUcpProfileUrl: string;
} | null {
  try {
    const parsed = new URL(agentUri);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    const origin = parsed.origin;
    return {
      hostedAgentUriUrl: agentUri,
      hostedUcpProfileUrl: `${origin}/.well-known/ucp`,
    };
  } catch {
    return null;
  }
}
