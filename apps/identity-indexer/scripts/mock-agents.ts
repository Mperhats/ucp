import http from "http";
import { z } from "zod";
import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import {
  UcpDiscoveryProfileSchema,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

type Route = readonly [RegExp, (match: RegExpMatchArray) => unknown];

interface AgentDescriptor {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  agentUriUrl: string;
  ucpProfileUrl: string;
}

interface MockConfig {
  port: number;
  baseUrl: string;
  ucpVersion: string;
  agentIds: string[];
}

const AGENT_PATHS = {
  wellKnownUcp: "/.well-known/ucp",
  agentUriFilename: "agent-uri.json",
} as const;

const UCP_SPEC = {
  shopping: {
    spec: "https://ucp.dev/specs/shopping",
    restSchema: "https://ucp.dev/services/shopping/openapi.json",
  },
  catalog: {
    spec: "https://ucp.dev/specs/shopping/catalog",
    schema: "https://ucp.dev/schemas/shopping/catalog.json",
  },
  checkout: {
    spec: "https://ucp.dev/specs/shopping/checkout",
    schema: "https://ucp.dev/schemas/shopping/checkout.json",
  },
  order: {
    spec: "https://ucp.dev/specs/shopping/order",
    schema: "https://ucp.dev/schemas/shopping/order.json",
  },
  refund: {
    spec: "https://ucp.dev/specs/shopping/refund",
    schema: "https://ucp.dev/schemas/shopping/refund.json",
  },
  return: {
    spec: "https://ucp.dev/specs/shopping/return",
    schema: "https://ucp.dev/schemas/shopping/return.json",
  },
  dispute: {
    spec: "https://ucp.dev/specs/shopping/dispute",
    schema: "https://ucp.dev/schemas/shopping/dispute.json",
  },
  discount: {
    spec: "https://ucp.dev/specs/shopping/discount",
    schema: "https://ucp.dev/schemas/shopping/discount.json",
  },
  fulfillment: {
    spec: "https://ucp.dev/specs/shopping/fulfillment",
    schema: "https://ucp.dev/schemas/shopping/fulfillment.json",
  },
  buyerConsent: {
    spec: "https://ucp.dev/specs/shopping/buyer_consent",
    schema: "https://ucp.dev/schemas/shopping/buyer_consent.json",
  },
} as const;

const AgentIdSchema = z.string().regex(/^[a-z0-9-]+$/);
const AgentIdListSchema = z
  .string()
  .regex(/^[a-z0-9-]+(,[a-z0-9-]+)*$/)
  .transform((value) => value.split(","))
  .pipe(z.array(AgentIdSchema).nonempty());
const RequestUrlSchema = z.string().min(1);
const UcpVersionSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function buildAgentDescriptor(
  id: string,
  index: number,
  baseUrl: string
): AgentDescriptor {
  const name = `Mock Merchant ${index + 1}`;
  const description = `Mock merchant agent ${index + 1} for local testing.`;
  const imageUrl = "https://example.com/agentimage.png";
  const agentUriUrl = `${baseUrl}/agents/${id}/${AGENT_PATHS.agentUriFilename}`;
  const ucpProfileUrl = `${baseUrl}/agents/${id}${AGENT_PATHS.wellKnownUcp}`;
  return {
    id,
    name,
    description,
    imageUrl,
    agentUriUrl,
    ucpProfileUrl,
  };
}

function stripWellKnownUcp(endpoint: string): string {
  return endpoint.replace(AGENT_PATHS.wellKnownUcp, "");
}

function buildAgentUri(agent: AgentDescriptor): AgentUriZod {
  return AgentUriZodSchema.parse({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: agent.name,
    description: agent.description,
    image: agent.imageUrl,
    endpoints: [
      {
        name: "UCP",
        endpoint: agent.ucpProfileUrl,
      },
    ],
    active: true,
    registrations: [],
  });
}

function buildUcpDiscoveryProfile(
  agent: AgentDescriptor,
  version: string
): UcpDiscoveryProfile {
  const endpointBase = stripWellKnownUcp(agent.ucpProfileUrl);
  return UcpDiscoveryProfileSchema.parse({
    ucp: {
      version,
      services: {
        "dev.ucp.shopping": {
          version,
          spec: UCP_SPEC.shopping.spec,
          rest: {
            schema: UCP_SPEC.shopping.restSchema,
            endpoint: endpointBase,
          },
        },
      },
      capabilities: [
        {
          name: "dev.ucp.shopping.catalog",
          version,
          spec: UCP_SPEC.catalog.spec,
          schema: UCP_SPEC.catalog.schema,
        },
        {
          name: "dev.ucp.shopping.checkout",
          version,
          spec: UCP_SPEC.checkout.spec,
          schema: UCP_SPEC.checkout.schema,
        },
        {
          name: "dev.ucp.shopping.order",
          version,
          spec: UCP_SPEC.order.spec,
          schema: UCP_SPEC.order.schema,
        },
        {
          name: "dev.ucp.shopping.refund",
          version,
          spec: UCP_SPEC.refund.spec,
          schema: UCP_SPEC.refund.schema,
          extends: "dev.ucp.shopping.order",
        },
        {
          name: "dev.ucp.shopping.return",
          version,
          spec: UCP_SPEC.return.spec,
          schema: UCP_SPEC.return.schema,
          extends: "dev.ucp.shopping.order",
        },
        {
          name: "dev.ucp.shopping.dispute",
          version,
          spec: UCP_SPEC.dispute.spec,
          schema: UCP_SPEC.dispute.schema,
          extends: "dev.ucp.shopping.order",
        },
        {
          name: "dev.ucp.shopping.discount",
          version,
          spec: UCP_SPEC.discount.spec,
          schema: UCP_SPEC.discount.schema,
          extends: "dev.ucp.shopping.checkout",
        },
        {
          name: "dev.ucp.shopping.fulfillment",
          version,
          spec: UCP_SPEC.fulfillment.spec,
          schema: UCP_SPEC.fulfillment.schema,
          extends: "dev.ucp.shopping.checkout",
        },
        {
          name: "dev.ucp.shopping.buyer_consent",
          version,
          spec: UCP_SPEC.buyerConsent.spec,
          schema: UCP_SPEC.buyerConsent.schema,
          extends: "dev.ucp.shopping.checkout",
        },
      ],
    },
    payment: {
      handlers: [
        {
          id: "shop_pay",
          name: "com.shopify.shop_pay",
          version,
          spec: "https://shopify.dev/ucp/handlers/shop_pay",
          config_schema: "https://shopify.dev/ucp/handlers/shop_pay/config.json",
          instrument_schemas: [
            "https://shopify.dev/ucp/handlers/shop_pay/instrument.json",
          ],
          config: {
            shop_id: "test-shop-id",
          },
        },
        {
          id: "google_pay",
          name: "google.pay",
          version: "1.0",
          spec: "https://example.com/spec",
          config_schema: "https://example.com/schema",
          instrument_schemas: [],
          config: {},
        },
        {
          id: "mock_payment_handler",
          name: "dev.ucp.mock_payment",
          version: "1.0",
          spec: "https://ucp.dev/specs/mock",
          config_schema: "https://ucp.dev/schemas/mock.json",
          instrument_schemas: [
            "https://ucp.dev/schemas/shopping/types/card_payment_instrument.json",
          ],
          config: {
            supported_tokens: ["success_token", "fail_token"],
          },
        },
      ],
    },
    signing_keys: [
      {
        kid: "mock-signing-key",
        kty: "RSA",
        use: "sig",
      },
    ],
  });
}

function buildAgentsListing(agents: AgentDescriptor[]) {
  return {
    agents: agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      agentUriUrl: agent.agentUriUrl,
      ucpProfileUrl: agent.ucpProfileUrl,
    })),
  };
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  payload: unknown
) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendNotFound(res: http.ServerResponse) {
  sendJson(res, 404, { error: "Not Found" });
}

function sendMethodNotAllowed(res: http.ServerResponse) {
  sendJson(res, 405, { error: "Method Not Allowed" });
}

function requireAgent(
  agentMap: Map<string, AgentDescriptor>,
  agentId: string
): AgentDescriptor {
  const agent = agentMap.get(agentId);
  if (!agent) throw new Error("agent_not_found");
  return agent;
}

function buildRoutes(args: {
  agentMap: Map<string, AgentDescriptor>;
  listingPayload: ReturnType<typeof buildAgentsListing>;
  ucpVersion: string;
}): Route[] {
  const agentFromMatch = (match: RegExpMatchArray) =>
    requireAgent(args.agentMap, AgentIdSchema.parse(match[1]));
  return [
    [/^\/$/, () => args.listingPayload],
    [/^\/agents$/, () => args.listingPayload],
    [/^\/agents\/([^/]+)$/, (match) => agentFromMatch(match)],
    [
      /^\/agents\/([^/]+)\/agent-uri\.json$/,
      (match) => buildAgentUri(agentFromMatch(match)),
    ],
    [
      /^\/agents\/([^/]+)\/\.well-known\/ucp$/,
      (match) => buildUcpDiscoveryProfile(agentFromMatch(match), args.ucpVersion),
    ],
  ];
}

function resolveRoute(routes: Route[], pathname: string) {
  const entry = routes.find(([pattern]) => pattern.test(pathname));
  if (!entry) return null;
  const match = pathname.match(entry[0]);
  if (!match) return null;
  return { handler: entry[1], match };
}

const EnvSchema = z
  .object({
    MOCK_AGENT_PORT: z.coerce.number().int().positive().default(4010),
    MOCK_AGENT_BASE_URL: z.string().url(),
    MOCK_UCP_VERSION: UcpVersionSchema.default("2026-01-11"),
    MOCK_AGENT_IDS: AgentIdListSchema,
  })
  .superRefine((env, ctx) => {
    const url = new URL(env.MOCK_AGENT_BASE_URL);
    const resolvedPort = url.port.length > 0 ? Number(url.port) : 80;
    if (resolvedPort !== env.MOCK_AGENT_PORT) {
      ctx.addIssue({
        code: "custom",
        message: "MOCK_AGENT_BASE_URL port must match MOCK_AGENT_PORT",
        path: ["MOCK_AGENT_BASE_URL"],
      });
    }
  })
  .transform((env): MockConfig => {
    return {
      port: env.MOCK_AGENT_PORT,
      baseUrl: env.MOCK_AGENT_BASE_URL,
      ucpVersion: env.MOCK_UCP_VERSION,
      agentIds: env.MOCK_AGENT_IDS,
    };
  });

function loadConfig(): MockConfig {
  return EnvSchema.parse(process.env);
}

const config = loadConfig();
const agents = config.agentIds.map((id, index) =>
  buildAgentDescriptor(id, index, config.baseUrl)
);
const agentMap = new Map(agents.map((agent) => [agent.id, agent]));
const listingPayload = buildAgentsListing(agents);

const routes = buildRoutes({
  agentMap,
  listingPayload,
  ucpVersion: config.ucpVersion,
});

const server = http.createServer((req, res) => {
  if (req.method !== "GET") return sendMethodNotAllowed(res);
  const requestUrl = RequestUrlSchema.safeParse(req.url);
  if (!requestUrl.success) return sendNotFound(res);
  const url = new URL(requestUrl.data, config.baseUrl);
  const resolved = resolveRoute(routes, url.pathname);
  if (!resolved) return sendNotFound(res);
  return sendJson(res, 200, resolved.handler(resolved.match));
});

server.listen(config.port, () => {
  console.log(`Mock agent host listening on ${config.baseUrl}`);
  console.log("Agents:");
  for (const agent of agents) {
    console.log(`- ${agent.id}`);
    console.log(`  agentURI: ${agent.agentUriUrl}`);
    console.log(`  ucp: ${agent.ucpProfileUrl}`);
  }
});
