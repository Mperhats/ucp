import { serve } from "@hono/node-server";
import type { Kysely } from "kysely";
import type { IndexerDb } from "./db.js";
import type { AppEnv } from "./env.js";
import { createApiApp } from "./api/app.js";

export function startApiServer(
  db: Kysely<IndexerDb>,
  env: AppEnv
): { stop: () => void } {
  const app = createApiApp({ db, env });
  const server = serve(
    {
      fetch: app.fetch,
      port: env.INDEXER_API_PORT,
    },
    (info) => {
      console.log(
        `Indexer API is running on http://localhost:${info.port}`
      );
    }
  );
  return {
    stop: () => {
      server.close();
    },
  };
}
