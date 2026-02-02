import type { IdentityEventRow, IndexedAgent } from "./db.js";

function buildIndexedAgent(row: IdentityEventRow): IndexedAgent {
  return {
    chainId: row.chain_id,
    agentId: row.agent_id,
    agentUri: row.agent_uri ?? "",
    owner: row.owner,
    registry: row.registry,
    sourceBlockNum: row.block_num,
    sourceLogIdx: row.log_idx,
    sourceTxHash: row.tx_hash,
  };
}

export function handleRow(row: IdentityEventRow): IndexedAgent {
  return buildIndexedAgent(row);
}
