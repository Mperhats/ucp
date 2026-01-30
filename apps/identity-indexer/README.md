# Identity Indexer

> Run `make infra-up` from the repo root before anything else.

Reads ERC-8004 registrations from Shovel tables (Postgres + Kysely), resolves
each `agentURI` (from the registry ABI), validates it against the ERC-8004
spec, and persists the agent URI JSON to Postgres.

## Requirements

- Node + pnpm
- Docker (Postgres + Shovel)
- Anvil running (see repo root `README.md`)

## Getting started

```bash
cp .env.local.example .env.local
pnpm install # post install script generates env schema
pnpm run infra:check
pnpm run shovel:up
pnpm generate:db-types
pnpm run dev
```

See `ENV.md` for the repo-wide env strategy and naming conventions. Runtime
values come from root `.env` + app `.env.local`, and types are generated from
root `.env.template` + app `.env.local.example`.

The indexer depends on generated contract ABIs/types for Shovel config. Run
`pnpm run infra:check` before `pnpm run dev` to ensure contract
types/addresses are up to date.

Shovel expects Anvil to be running on the shared `ucp` Docker network (from
`make -C ../.. anvil`).

Shovel connects to Postgres via the Docker service name `postgres`. The app
continues to use `DATABASE_URL` for local access (typically `127.0.0.1`).

## Commands

```bash
pnpm run dev
pnpm run build
pnpm run start
pnpm run env:generate
pnpm run shovel:config
pnpm run shovel:up
pnpm run shovel:down
pnpm run shovel:logs
pnpm run generate:db-types
pnpm run register-agent
pnpm run verify-agent
```

## Shovel

Shovel is managed via the app scripts and runs via Docker Compose with the
app-level config in `shovel/docker-compose.yml`.

### Postgres env

Postgres settings live in `.env.local` and are used by the indexer and Shovel
containers.

### Add a new Shovel integration

Add a new entry in `shovel/shovel-integrations.ts` using `defineEventIntegration`.
Example:

```ts
defineEventIntegration({
  contractName: "ReputationRegistry",
  shovelName: "erc8004_reputation_response_appended",
  tableName: "erc8004_reputation_response_events",
  addressColumn: "registry",
  eventName: "ResponseAppended",
  inputs: {
    agentId: { column: "agent_id", type: "numeric" },
    clientAddress: { column: "client_address", type: "bytea" },
    feedbackIndex: { column: "feedback_index", type: "numeric" },
    responder: { column: "responder", type: "bytea" },
    responseURI: { column: "response_uri", type: "text" },
  },
})
```

Then regenerate the config (or restart the indexer to auto-generate):

```bash
pnpm run shovel:config
```


## Notes

- The indexer polls `erc8004_identity_events` and writes resolved agent URIs to
  `identity_indexer_agents`.
- The poller persists its cursor in Postgres (`identity_indexer_cursor`).
- If `agentURI` is unreachable or invalid, the record is skipped and retried on
  the next poll.
