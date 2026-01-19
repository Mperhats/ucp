import { createDb, ensureSchema } from "./db.js";
import { env } from "./env.js";
import { startIndexer } from "./indexer.js";
import { startApiServer } from "./server.js";

async function main(): Promise<void> {
  const db = createDb(env);
  await ensureSchema(db);

  const { stop: stopIndexer } = await startIndexer(db, env);
  const { stop: stopApi } = startApiServer(db, env);

  const shutdown = async () => {
    stopIndexer();
    stopApi();
    await db.destroy();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
