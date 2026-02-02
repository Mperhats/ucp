import type { ColumnType } from "kysely";
import type { IPostgresInterval } from "postgres-interval";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Interval = ColumnType<IPostgresInterval, IPostgresInterval | number, IPostgresInterval | number>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Numeric = ColumnType<string, number | string, number | string>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Erc8004IdentityEvents {
  abi_idx: number | null;
  agent_id: Numeric | null;
  agent_uri: string | null;
  block_num: Numeric | null;
  chain_id: number | null;
  ig_name: string | null;
  log_idx: number | null;
  owner: Buffer | null;
  registry: Buffer | null;
  src_name: string | null;
  tx_hash: Buffer | null;
  tx_idx: number | null;
}

export interface Erc8004IdentityUriEvents {
  abi_idx: number | null;
  agent_id: Numeric | null;
  block_num: Numeric | null;
  chain_id: number | null;
  ig_name: string | null;
  log_idx: number | null;
  new_uri: string | null;
  registry: Buffer | null;
  src_name: string | null;
  tx_hash: Buffer | null;
  tx_idx: number | null;
  updated_by: Buffer | null;
}

export interface Erc8004IdentityWalletEvents {
  agent_id: Numeric | null;
  block_num: Numeric | null;
  chain_id: number | null;
  ig_name: string | null;
  log_idx: number | null;
  new_wallet: Buffer | null;
  registry: Buffer | null;
  set_by: Buffer | null;
  src_name: string | null;
  tx_hash: Buffer | null;
  tx_idx: number | null;
}

export interface Erc8004ReputationResponseEvents {
  abi_idx: number | null;
  agent_id: Numeric | null;
  block_num: Numeric | null;
  chain_id: number | null;
  client_address: Buffer | null;
  feedback_index: Numeric | null;
  ig_name: string | null;
  log_idx: number | null;
  registry: Buffer | null;
  responder: Buffer | null;
  response_uri: string | null;
  src_name: string | null;
  tx_hash: Buffer | null;
  tx_idx: number | null;
}

export interface Erc8004ReputationRevokedEvents {
  agent_id: Numeric | null;
  block_num: Numeric | null;
  chain_id: number | null;
  client_address: Buffer | null;
  feedback_index: Numeric | null;
  ig_name: string | null;
  log_idx: number | null;
  registry: Buffer | null;
  src_name: string | null;
  tx_hash: Buffer | null;
  tx_idx: number | null;
}

export interface Erc8004ValidationRequestEvents {
  abi_idx: number | null;
  agent_id: Numeric | null;
  block_num: Numeric | null;
  chain_id: number | null;
  ig_name: string | null;
  log_idx: number | null;
  registry: Buffer | null;
  request_hash: Buffer | null;
  request_uri: string | null;
  src_name: string | null;
  tx_hash: Buffer | null;
  tx_idx: number | null;
  validator_address: Buffer | null;
}

export interface Erc8004ValidationResponseEvents {
  abi_idx: number | null;
  agent_id: Numeric | null;
  block_num: Numeric | null;
  chain_id: number | null;
  ig_name: string | null;
  log_idx: number | null;
  registry: Buffer | null;
  request_hash: Buffer | null;
  response: Numeric | null;
  response_hash: Buffer | null;
  response_uri: string | null;
  src_name: string | null;
  tag: string | null;
  tx_hash: Buffer | null;
  tx_idx: number | null;
  validator_address: Buffer | null;
}

export interface ShovelIgUpdates {
  backfill: Generated<boolean | null>;
  latency: Interval | null;
  name: string;
  nrows: Numeric | null;
  num: Numeric;
  src_name: string;
  stop: Numeric | null;
}

export interface ShovelIntegrations {
  conf: Json | null;
  name: string | null;
}

export interface ShovelLatest {
  num: Numeric | null;
  src_name: string | null;
}

export interface ShovelSources {
  chain_id: number | null;
  name: string | null;
  url: string | null;
}

export interface ShovelSourceUpdates {
  hash: Buffer | null;
  latency: Interval | null;
  nblocks: Numeric | null;
  nrows: Numeric | null;
  num: Numeric | null;
  src_hash: Buffer | null;
  src_name: string | null;
  src_num: Numeric | null;
}

export interface ShovelTaskUpdates {
  chain_id: number | null;
  hash: Buffer | null;
  ig_name: string | null;
  insert_at: Generated<Timestamp | null>;
  latency: Interval | null;
  nblocks: Numeric | null;
  nrows: Numeric | null;
  num: Numeric | null;
  src_hash: Buffer | null;
  src_name: string | null;
  src_num: Numeric | null;
  stop: Numeric | null;
}

export interface DB {
  erc8004_identity_events: Erc8004IdentityEvents;
  erc8004_identity_uri_events: Erc8004IdentityUriEvents;
  erc8004_identity_wallet_events: Erc8004IdentityWalletEvents;
  erc8004_reputation_response_events: Erc8004ReputationResponseEvents;
  erc8004_reputation_revoked_events: Erc8004ReputationRevokedEvents;
  erc8004_validation_request_events: Erc8004ValidationRequestEvents;
  erc8004_validation_response_events: Erc8004ValidationResponseEvents;
  "shovel.ig_updates": ShovelIgUpdates;
  "shovel.integrations": ShovelIntegrations;
  "shovel.latest": ShovelLatest;
  "shovel.source_updates": ShovelSourceUpdates;
  "shovel.sources": ShovelSources;
  "shovel.task_updates": ShovelTaskUpdates;
}
