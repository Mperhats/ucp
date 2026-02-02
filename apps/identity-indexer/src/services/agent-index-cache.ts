import type { Kysely } from "kysely";
import {
  fetchIndexedAgentsForUcp,
  type IndexedAgentUcpRow,
  type IndexerDb,
} from "../db.js";
import { log } from "../logger.js";
import { parseAgentHostFromUri } from "../utils/agent-url-utils.js";

interface AgentHostIndex {
  agentByHost: Map<string, IndexedAgentUcpRow>;
  total: number;
}

export class AgentIndexCache {
  private index: AgentHostIndex;
  private db: Kysely<IndexerDb>;

  constructor(db: Kysely<IndexerDb>) {
    this.db = db;
    this.index = { agentByHost: new Map(), total: 0 };
  }

  get size(): number {
    return this.index.agentByHost.size;
  }

  get total(): number {
    return this.index.total;
  }

  getByHost(host: string): IndexedAgentUcpRow | undefined {
    return this.index.agentByHost.get(host);
  }

  getAgentUris(): string[] {
    const uris = Array.from(this.index.agentByHost.values()).map(
      (row) => row.agent_uri
    );
    return Array.from(new Set(uris)).sort();
  }

  async load(): Promise<void> {
    const agentRows = await fetchIndexedAgentsForUcp(this.db);
    const agentByHost = new Map<string, IndexedAgentUcpRow>();

    for (const row of agentRows) {
      const host = parseAgentHostFromUri(row.agent_uri);
      if (!host) {
        log.warn("indexer.api.agent_uri.invalid", {
          agentId: row.agent_id,
          chainId: row.chain_id,
          agentUri: row.agent_uri,
        });
        continue;
      }
      agentByHost.set(host, row);
    }

    this.index = {
      agentByHost,
      total: agentRows.length,
    };
  }
}
