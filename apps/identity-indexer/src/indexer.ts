import * as Hex from "ox/Hex";
import type { AppEnv } from "./env.js";
import {
  fetchIdentityEvents,
  loadCursor,
  saveCursor,
  upsertIndexedAgent,
  type IndexedAgent,
  type IndexerCursor,
} from "./db.js";
import type { Kysely } from "kysely";
import type { IndexerDb } from "./db.js";
import { log } from "./logger.js";
import { handleRow } from "./agent-indexing.js";

const DEFAULT_CURSOR: IndexerCursor = {
  lastBlockNum: "0",
  lastLogIdx: 0
};

const ACTIVE_DELAY_MS = 250;

async function processBatch(
  db: Kysely<IndexerDb>,
  env: AppEnv,
  cursor: IndexerCursor
): Promise<{ cursor: IndexerCursor; processed: number }> {
  const rows = await fetchIdentityEvents(db, cursor, env.INDEXER_BATCH_SIZE);
  if (rows.length === 0) return { cursor, processed: 0 };

  let nextCursor = cursor;
  for (const row of rows) {
    const indexed = handleRow(row);
    if (!indexed.agentUri) {
      log.warn("indexer.agent.skipped", {
        chainId: indexed.chainId,
        agentId: indexed.agentId,
        reason: "missing_agent_uri",
      });
    } else {
      await upsertIndexedAgent(db, indexed);
      log.info("indexer.row.processed", {
        chainId: indexed.chainId,
        agentId: indexed.agentId,
        agentUri: indexed.agentUri,
        blockNum: indexed.sourceBlockNum,
        logIdx: indexed.sourceLogIdx,
        txHash: indexed.sourceTxHash ? Hex.fromBytes(indexed.sourceTxHash) : null,
      });
    }
    nextCursor = { lastBlockNum: row.block_num, lastLogIdx: row.log_idx };
    await saveCursor(db, nextCursor);
  }

  return { cursor: nextCursor, processed: rows.length };
}

export async function startIndexer(
  db: Kysely<IndexerDb>,
  env: AppEnv
): Promise<{ stop: () => void }> {
  let cursor = await loadCursor(db, DEFAULT_CURSOR);
  log.info("indexer.cursor.loaded", cursor);
  let isRunning = true;
  let isProcessing = false;
  let lastProcessed = 0;

  const tick = async () => {
    if (!isRunning || isProcessing) return;
    isProcessing = true;
    try {
      const result = await processBatch(db, env, cursor);
      cursor = result.cursor;
      lastProcessed = result.processed;
    } finally {
      isProcessing = false;
      if (isRunning) {
        const delay =
          lastProcessed > 0 ? ACTIVE_DELAY_MS : env.INDEXER_POLL_INTERVAL_MS;
        setTimeout(tick, delay);
      }
    }
  };

  tick();

  return {
    stop: () => {
      isRunning = false;
    }
  };
}
