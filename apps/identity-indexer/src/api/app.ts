import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Kysely } from "kysely";
import type { IndexerDb } from "../db.js";
import type { AppEnv } from "../env.js";
import { createAgentsHandlers } from "./agents-handlers.js";
import { createDiscoveryHandlers } from "./discovery-handlers.js";
import {
  AgentIdParamSchema,
  ListAgentsQuerySchema,
  prettyValidation,
} from "../utils/validation.js";

interface ApiAppArgs {
  db: Kysely<IndexerDb>;
  env: AppEnv;
}

export function createApiApp(args: ApiAppArgs) {
  const app = new Hono();
  const agentsHandlers = createAgentsHandlers(args);
  const discoveryHandlers = createDiscoveryHandlers(args);

  app.get(
    "/agents",
    zValidator("query", ListAgentsQuerySchema, prettyValidation),
    agentsHandlers.listAgents
  );

  app.get(
    "/agents/:agentId",
    zValidator("param", AgentIdParamSchema, prettyValidation),
    agentsHandlers.getAgent
  );

  app.get(
    "/agents/:agentId/agent-uri.json",
    zValidator("param", AgentIdParamSchema, prettyValidation),
    agentsHandlers.getAgentUri
  );

  app.get(
    "/agents/:agentId/.well-known/ucp",
    zValidator("param", AgentIdParamSchema, prettyValidation),
    discoveryHandlers.getAgentDiscovery
  );

  app.get("/.well-known/ucp", discoveryHandlers.getHostedDiscovery);

  app.get("/agent-uri.json", agentsHandlers.getHostedAgentUri);

  return app;
}
