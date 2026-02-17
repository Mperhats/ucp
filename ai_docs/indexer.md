Yep — Shovel is a great fit for this. Conceptually it’s:

**Anvil (RPC) → Shovel (eth_getLogs + ABI decode) → Postgres tables**

Shovel’s config is just:

* `pg_url` (Postgres connection string)
* `eth_sources` (RPC URL(s))
* `integrations[]` mapping **events → table columns** ([indexsupply.com][1])

And Shovel is distributed as a Docker image (`indexsupply/shovel`). ([indexsupply.com][1])

---

## 1) Add Postgres + Shovel to your existing docker-compose

Assuming you already have `anvil` in `infra/docker-compose.yml`, add:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: shovel
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d shovel"]
      interval: 1s
      timeout: 2s
      retries: 30

  anvil:
    image: ghcr.io/foundry-rs/foundry:stable
    container_name: anvil
    ports:
      - "8545:8545"
    command: >
      anvil --host 0.0.0.0 --port 8545
      --chain-id 31337
      --mnemonic "test test test test test test test test test test test junk"
      --balance 1000000

  shovel:
    image: indexsupply/shovel:latest
    container_name: shovel
    depends_on:
      postgres:
        condition: service_healthy
      anvil:
        condition: service_started
    volumes:
      - ./shovel:/shovel
    command: >
      shovel -config /shovel/erc8004.json
    restart: unless-stopped
```

Why this works:

* Shovel expects a JSON config describing what to index and where to write it. ([indexsupply.com][1])
* Using container DNS names (`postgres`, `anvil`) makes `pg_url` and RPC URLs stable inside the Compose network.

---

## 2) Deploy IdentityRegistry first (and capture its address)

You *must* deploy the IdentityRegistry before indexing (Shovel will filter on the contract address for performance). Shovel’s docs specifically recommend filtering on `log_addr` to reduce data and speed up `eth_getLogs`. ([indexsupply.com][1])

After you deploy, copy the deployed registry address (e.g., `0xAbc...`).

---

## 3) Create a Shovel config to index IdentityRegistry events

Create `infra/shovel/erc8004.json` (path should match the volume mount `./shovel:/shovel` above).

**Important:** You need the ABI snippet for the specific event you want to index. Shovel’s docs show you inline the ABI “event” object and map each input to a Postgres column using `column`. ([indexsupply.com][1])

Here’s a template that indexes a common “registration” event shape (adjust the event name + inputs to match your repo):

```json
{
  "pg_url": "postgres://postgres:postgres@postgres:5432/shovel",
  "eth_sources": [
    {
      "name": "local",
      "chain_id": 31337,
      "urls": ["http://anvil:8545"]
    }
  ],
  "integrations": [
    {
      "name": "erc8004_identity_registry",
      "enabled": true,
      "sources": [{ "name": "local", "start": 0 }],
      "table": {
        "name": "erc8004_identity_events",
        "columns": [
          { "name": "chain_id", "type": "numeric" },
          { "name": "block_num", "type": "numeric" },
          { "name": "tx_hash", "type": "bytea" },
          { "name": "log_idx", "type": "numeric" },
          { "name": "registry", "type": "bytea" },

          { "name": "agent_id", "type": "numeric" },
          { "name": "owner", "type": "bytea" },
          { "name": "agent_uri", "type": "text" }
        ]
      },

      "block": [
        { "name": "chain_id", "column": "chain_id" },
        { "name": "block_num", "column": "block_num" },
        { "name": "tx_hash", "column": "tx_hash" },
        { "name": "log_idx", "column": "log_idx" },

        {
          "name": "log_addr",
          "column": "registry",
          "filter_op": "contains",
          "filter_arg": ["0xYOUR_IDENTITY_REGISTRY_ADDRESS_HERE"]
        }
      ],

      "event": {
        "type": "event",
        "name": "Registered",
        "anonymous": false,
        "inputs": [
          { "indexed": false, "name": "agentId", "type": "uint256", "column": "agent_id" },
          { "indexed": true,  "name": "owner",   "type": "address", "column": "owner" },
          { "indexed": false, "name": "agentURI","type": "string",  "column": "agent_uri" }
        ]
      }
    }
  ]
}
```

Notes:

* The `block` section includes a `log_addr` filter (mapped into your `registry` column) to constrain `eth_getLogs`. That’s the recommended performance pattern. ([indexsupply.com][1])
* Shovel will **create the table on startup** based on `table.columns`. ([indexsupply.com][1])

### How to get the correct event ABI quickly

From your contracts subtree, run:

```bash
forge inspect IdentityRegistry abi | jq .
```

Find the event you care about (e.g., `Registered` / `Register` / `URIUpdated` / `Transfer`) and copy the exact `name`, `anonymous`, and `inputs` types/indexed flags into the config.

---

## 4) Bring it up

```bash
docker compose -f infra/docker-compose.yml up -d postgres anvil
# deploy your IdentityRegistry now (forge script --broadcast)
docker compose -f infra/docker-compose.yml up -d shovel
docker compose -f infra/docker-compose.yml logs -f shovel
```

On startup, Shovel will:

* connect to Postgres + RPC
* create the target table(s)
* start indexing from `start` (0) up to head, then tail new blocks. ([indexsupply.com][1])

---

## 5) Query the DB

```bash
docker exec -it postgres psql -U postgres -d shovel -c \
  "select block_num, encode(tx_hash,'hex') as tx, agent_id, encode(owner,'hex') as owner, agent_uri
   from erc8004_identity_events
   order by block_num desc, log_idx desc
   limit 20;"
```

---

## 6) Best-practice: generate config via TypeScript (optional, but very “pnpm monorepo”)

Shovel maintains a TS package `@indexsupply/shovel-config` so you can generate JSON config using loops/env vars (great when you have many chains/contracts). ([indexsupply.com][1])
You can add a `packages/shovel-config/` that outputs `infra/shovel/erc8004.json`.

---

## The only thing I still need from you to make this exact

The **actual event name + args** in your ERC-8004 subtree.

If you paste the output of:

```bash
cd contracts/erc-8004
forge inspect IdentityRegistry abi | jq '.[] | select(.type=="event") | {name, inputs}'
```

…I’ll rewrite the exact `erc8004.json` integration so it matches your contract perfectly (no guessing on `Registered` vs `URIUpdated`, etc.).

[1]: https://indexsupply.com/shovel/docs/ "Shovel Docs"



Both — but with a clear split:

## What belongs in `/infra`

Put **things that are environment wiring / deployment artifacts** there:

* `docker-compose.yml` (anvil, postgres, shovel)
* `infra/shovel/*.json` (or the generated output configs)
* `.env.example` for connection strings / contract addresses
* helper scripts like `infra/bin/wait-for-anvil.sh`

Think of `/infra` as “how to boot the world.”

✅ **Shovel config files as *artifacts*** belong in `/infra/shovel/…` because they’re deployment config, not application code.

---

## What belongs in an indexing service app (recommended)

Put **logic and ownership** in an actual app, e.g. `apps/indexer/`:

* generating Shovel configs from code (TS) based on env + chainIds + contract addresses
* migrations / schema expectations (optional)
* post-processing (fetch `agentURI` JSON, validate it, fetch `/.well-known/ucp`, store snapshots)
* health checks + metrics
* backfills, reorg handling policies, retries
* writing to the rest of your DB tables beyond the raw events table(s)

This is where the “real system” lives.

✅ Shovel itself is a great **raw event ingestion** layer, but you almost always want an app that sits on top of its tables and turns events into your canonical models.

---

## Best-practice structure for your monorepo

Here’s the pattern that scales:

```
/infra
  docker-compose.yml
  /shovel
    erc8004.identity.json        # generated output (committed or not)
    ...                          # other integrations
/apps
  /indexer
    src/
      generateShovelConfig.ts    # writes to infra/shovel/*.json
      ingestAgents.ts            # reads shovel tables -> fetches agentURI -> writes canonical tables
      ingestUcpProfiles.ts       # fetches /.well-known/ucp -> snapshots
    package.json
/packages
  /shovel-config                 # optional shared generator lib
```

### Two good workflows

**Workflow A (simple MVP):**

* Hand-write `infra/shovel/erc8004.json`
* Run `shovel` from docker-compose
* Build a tiny `apps/indexer` that reads Postgres tables produced by Shovel and enriches them.

**Workflow B (cleaner, slightly more work):**

* `apps/indexer` generates config file(s) into `/infra/shovel/` at startup (or via a build step)
* `shovel` uses those configs
* same enrichment step as above

---

## Rule of thumb

* If it’s **declarative plumbing** (docker, ports, RPC URLs, shovel mappings): `/infra`
* If it’s **logic** (deriving business objects, fetching URIs, validating, caching, reprocessing): `apps/indexer`

If you tell me whether you want the Shovel config to be **checked into git** or **generated at runtime**, I’ll recommend the exact approach and Makefile targets (`make infra-up`, `make indexer`, `make shovel-reset`, etc.).
