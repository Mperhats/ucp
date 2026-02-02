import { Kysely, PostgresDialect, sql, type Selectable } from "kysely";
import { Pool } from "pg";
import type { AppEnv } from "./env.js";
import type { DB } from "./_generated/db-types.js";

type IdentityEventTable = Selectable<DB["erc8004_identity_events"]>;

export type IdentityEventRow = Pick<
  IdentityEventTable,
  | "chain_id"
  | "block_num"
  | "log_idx"
  | "tx_hash"
  | "registry"
  | "agent_id"
  | "agent_uri"
  | "owner"
>;
export type { DB };

export interface IndexedAgent {
  chainId: IdentityEventRow["chain_id"];
  agentId: IdentityEventRow["agent_id"];
  agentUri: string;
  owner: IdentityEventRow["owner"];
  registry: IdentityEventRow["registry"];
  sourceBlockNum: IdentityEventRow["block_num"];
  sourceLogIdx: IdentityEventRow["log_idx"];
  sourceTxHash: IdentityEventRow["tx_hash"];
}

export interface IndexedAgentUcpRow {
  chain_id: IndexerAgentRow["chain_id"];
  agent_id: IndexerAgentRow["agent_id"];
  agent_uri: IndexerAgentRow["agent_uri"];
}

interface IndexerAgentRow {
  chain_id: IdentityEventRow["chain_id"];
  agent_id: IdentityEventRow["agent_id"];
  registry: IdentityEventRow["registry"];
  owner: IdentityEventRow["owner"];
  agent_uri: string;
  source_block_num: IdentityEventRow["block_num"];
  source_log_idx: IdentityEventRow["log_idx"];
  source_tx_hash: IdentityEventRow["tx_hash"];
  updated_at: Date;
}

interface IndexerCursorRow {
  id: string;
  last_block_num: IdentityEventRow["block_num"];
  last_log_idx: IdentityEventRow["log_idx"];
  updated_at: Date;
}

const DEFAULT_CURSOR_ID = "default";

export interface IndexerDb extends DB {
  identity_indexer_agents: IndexerAgentRow;
  identity_indexer_cursor: IndexerCursorRow;
}

export interface IndexerCursor {
  lastBlockNum: IdentityEventRow["block_num"];
  lastLogIdx: IdentityEventRow["log_idx"];
}

export function createDb(env: AppEnv): Kysely<IndexerDb> {
  const databaseUrl = normalizeDatabaseUrl(env.DATABASE_URL);
  return new Kysely<IndexerDb>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: databaseUrl })
    })
  });
}

function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "postgres") {
      parsed.hostname = "127.0.0.1";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function ensureSchema(db: Kysely<IndexerDb>): Promise<void> {
  await db.schema
    .createIndex("erc8004_identity_events_block_log_idx")
    .ifNotExists()
    .on("erc8004_identity_events")
    .columns(["block_num", "log_idx"])
    .execute();
  await db.schema
    .createTable("identity_indexer_agents")
    .ifNotExists()
    .addColumn("chain_id", "integer", (col) => col.notNull())
    .addColumn("agent_id", "numeric", (col) => col.notNull())
    .addColumn("registry", "bytea", (col) => col.notNull())
    .addColumn("owner", "bytea", (col) => col.notNull())
    .addColumn("agent_uri", "text", (col) => col.notNull())
    .addColumn("source_block_num", "numeric", (col) => col.notNull())
    .addColumn("source_log_idx", "integer", (col) => col.notNull())
    .addColumn("source_tx_hash", "bytea", (col) => col.notNull())
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addPrimaryKeyConstraint("identity_indexer_agents_pkey", [
      "chain_id",
      "agent_id"
    ])
    .execute();
  await db.schema
    .createTable("identity_indexer_cursor")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.notNull())
    .addColumn("last_block_num", "numeric", (col) => col.notNull())
    .addColumn("last_log_idx", "integer", (col) => col.notNull())
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addPrimaryKeyConstraint("identity_indexer_cursor_pkey", ["id"])
    .execute();
}

export async function fetchIdentityEvents(
  db: Kysely<IndexerDb>,
  cursor: IndexerCursor,
  limit: number
): Promise<IdentityEventRow[]> {
  return await db
    .selectFrom("erc8004_identity_events")
    .select([
      "chain_id",
      "block_num",
      "log_idx",
      "tx_hash",
      "registry",
      "agent_id",
      "agent_uri",
      "owner"
    ])
    .where((eb: any) =>
      eb.or([
        eb("block_num", ">", cursor.lastBlockNum),
        eb.and([
          eb("block_num", "=", cursor.lastBlockNum),
          eb("log_idx", ">", cursor.lastLogIdx)
        ])
      ])
    )
    .orderBy("block_num", "asc")
    .orderBy("log_idx", "asc")
    .limit(limit)
    .execute();
}

export async function fetchIndexedAgentsForUcp(
  db: Kysely<IndexerDb>
): Promise<IndexedAgentUcpRow[]> {
  return await db
    .selectFrom("identity_indexer_agents")
    .select(["chain_id", "agent_id", "agent_uri"])
    .where("agent_uri", "like", "%/.well-known/ucp")
    .execute();
}

export async function upsertIndexedAgent(
  db: Kysely<IndexerDb>,
  agent: IndexedAgent
): Promise<void> {
  if (!agent.agentUri) return;
  await db
    .insertInto("identity_indexer_agents")
    .values({
      chain_id: agent.chainId,
      agent_id: agent.agentId,
      registry: agent.registry,
      owner: agent.owner,
      agent_uri: agent.agentUri,
      source_block_num: agent.sourceBlockNum,
      source_log_idx: agent.sourceLogIdx,
      source_tx_hash: agent.sourceTxHash,
      updated_at: new Date()
    })
    .onConflict((oc) =>
      oc.columns(["chain_id", "agent_id"]).doUpdateSet({
        registry: agent.registry,
        owner: agent.owner,
        agent_uri: agent.agentUri,
        source_block_num: agent.sourceBlockNum,
        source_log_idx: agent.sourceLogIdx,
        source_tx_hash: agent.sourceTxHash,
        updated_at: new Date()
      })
    )
    .execute();
}

export async function loadCursor(
  db: Kysely<IndexerDb>,
  fallback: IndexerCursor
): Promise<IndexerCursor> {
  const row = await db
    .selectFrom("identity_indexer_cursor")
    .select(["last_block_num", "last_log_idx"])
    .where("id", "=", DEFAULT_CURSOR_ID)
    .executeTakeFirst();
  if (!row) return fallback;
  return {
    lastBlockNum: row.last_block_num,
    lastLogIdx: row.last_log_idx
  };
}

export async function saveCursor(
  db: Kysely<IndexerDb>,
  cursor: IndexerCursor
): Promise<void> {
  await db
    .insertInto("identity_indexer_cursor")
    .values({
      id: DEFAULT_CURSOR_ID,
      last_block_num: cursor.lastBlockNum,
      last_log_idx: cursor.lastLogIdx,
      updated_at: new Date()
    })
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        last_block_num: cursor.lastBlockNum,
        last_log_idx: cursor.lastLogIdx,
        updated_at: new Date()
      })
    )
    .execute();
}
