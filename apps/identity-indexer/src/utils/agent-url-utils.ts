export interface AgentUrls {
  hostedAgentUriUrl: string;
  hostedUcpProfileUrl: string;
}

interface HostedOriginArgs {
  agentId: string;
  hostBase: string;
  port: number;
  protocol: "http" | "https";
}

export function buildHostedOrigin(args: HostedOriginArgs): string {
  return `${args.protocol}://${args.agentId}.${args.hostBase}:${args.port}`;
}

export function buildAgentUrls(args: {
  origin: string;
  protocol: "http" | "https";
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
    hostedAgentUriUrl: `${hostedOrigin}/.well-known/agent-uri.json`,
    hostedUcpProfileUrl: `${hostedOrigin}/.well-known/ucp`,
  };
}

export function parseAgentHostFromUri(agentUri: string): string | null {
  try {
    const url = new URL(agentUri);
    if (!url.pathname.endsWith("/.well-known/ucp")) return null;
    return url.host;
  } catch {
    return null;
  }
}

export function resolveRequestOrigin(args: {
  host: string;
  protoHeader?: string | null;
}): string {
  const protocol = args.protoHeader?.split(",")[0]?.trim() || "http";
  return `${protocol}://${args.host}`;
}

export function getHostHeader(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  return headerValue.trim() || null;
}
