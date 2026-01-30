import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import type { Kysely } from "kysely";
import type { AppEnv } from "../env.js";
import { DiscoveryService } from "../services/discovery.js";
import type { IndexerDb } from "../db.js";
import { log } from "../logger.js";
import {
  getHostHeader,
  resolveRequestOrigin,
} from "../utils/agent-url-utils.js";
import { createVersionMiddleware } from "../utils/hono-utils.js";
import { AgentIndexCache } from "../services/agent-index-cache.js";

function buildDiscoveryHandler(args: { env: AppEnv; cache: AgentIndexCache }) {
  const createDiscoveryService = (endpointOrigin: string) =>
    new DiscoveryService({
      ucpVersion: args.env.INDEXER_UCP_VERSION,
      endpointOrigin,
    });

  return (c: Context) => {
    const host = getHostHeader(c.req.header("host"));
    if (!host) return c.json({ error: "Missing Host header" }, 400);

    const agent = args.cache.getByHost(host);
    if (!agent) return c.json({ error: "Unknown agent host" }, 404);

    const endpointOrigin = resolveRequestOrigin({
      host,
      protoHeader: c.req.header("x-forwarded-proto"),
    });
    const discoveryService = createDiscoveryService(endpointOrigin);
    return discoveryService.getMerchantProfile(c);
  };
}

function buildDiscoveryApp(args: { env: AppEnv; cache: AgentIndexCache }): Hono {
  const app = new Hono();

  app.use(createVersionMiddleware(args.env.INDEXER_UCP_VERSION));
  app.get("/.well-known/ucp", buildDiscoveryHandler(args));

  return app;
}

export async function startApiServer(args: {
  db: Kysely<IndexerDb>;
  env: AppEnv;
}): Promise<{ stop: () => void }> {
  const cache = new AgentIndexCache(args.db);
  await cache.load();

  log.info("indexer.api.agent_cache.loaded", {
    total: cache.total,
    hosts: cache.size,
  });
  log.info("indexer.api.agent_cache.urls", {
    urls: cache.getAgentUris(),
  });

  const app = buildDiscoveryApp({ env: args.env, cache });
  const server = serve(
    {
      fetch: app.fetch,
      port: args.env.INDEXER_API_PORT,
    },
    (info) => {
      log.info("indexer.api.server.started", {
        port: info.port,
      });
    }
  );

  return {
    stop: () => {
      server.close();
    },
  };
}
