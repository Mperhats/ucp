# Implementation Prompt (paste this into an AI coding agent)

You are an expert full-stack + protocol engineer. Implement a minimal but real end-to-end system that:

1. supports **permissionless partner/merchant discovery** (ERC-8004 Identity Registry + indexer),
2. supports **merchant-scoped catalog discovery via UCP Catalog** (`dev.ucp.shopping.catalog`, PR #55) with `variant.id -> checkout item.id`, including marketplace context via `seller`, ([GitHub][1])
3. runs **UCP checkout + order lifecycle** using the official UCP samples as reference, ([Google Developers Blog][2])
4. uses **onchain authorize/capture escrow** (Base Commerce Payments Protocol) for delivery-friendly payment hold + capture, ([GitHub][3])
5. mints/distributes **reward tokens** on capture (inspired by Base Flywheel’s pattern integrating with AuthCaptureEscrow), ([GitHub][4])
6. is organized as a **TypeScript monorepo** inspired by **Ox + Viem** module layout and strong typing (no `any[]`, tight types, internal core primitives), ([GitHub][5])
7. optionally includes a “session/delegation” stub inspired by **Porto** (do not implement full passkeys; just design the interface + placeholder). ([GitHub][6])

## Constraints

* TypeScript everywhere except where you directly reuse UCP’s Python sample server.
* Use **Viem** for EVM interaction (clients, contract read/write). ([GitHub][7])
* Organize low-level primitives in an “Ox-like” way: small composable modules for IDs/Hex/Bytes/errors, and higher-level “clients” on top. ([GitHub][5])
* Use Prisma + Postgres for indexing and order state.
* Local dev must run fully offline with a local EVM (Anvil) and local Postgres.
* Produce **working code** (not just docs). Provide scripts/commands.

---

# 0) Canonical upstream references (use these as truth)

### UCP

Use UCP’s official “Under the Hood” flow and repos:

* It explicitly clones `Universal-Commerce-Protocol/python-sdk` and `Universal-Commerce-Protocol/samples` and runs the Python business server. ([Google Developers Blog][2])

### UCP Catalog (PR #55)

Implement the capability semantics exactly as described:

* Adds `dev.ucp.shopping.catalog` and defines `Variant.id: used as item.id in checkout` and `seller: optional marketplace context`. ([GitHub][1])
* REST endpoints: `POST /catalog/search -> search_catalog`, `GET /catalog/item/{id} -> get_catalog_item`. ([GitHub][1])
* Lookup rules and “NOT_FOUND returns HTTP 200 with error message” behavior. ([GitHub][1])

### Escrow / payments

Use Base Commerce Payments Protocol as the escrow foundation:

* It is explicitly “authorize and capture” style with protections and modular authorization methods. ([GitHub][3])

### Rewards

Take inspiration from Base Flywheel’s contracts:

* CashbackRewards integrates with AuthCaptureEscrow for payment verification and tracks allocation/distribution state. ([GitHub][4])

### Delegation/session inspiration (interface only)

Use Porto for conceptual interface (session keys/7702), but don’t implement full passkey UX:

* Porto is “Authentication & payments on the web” and is a reference for session/delegation UX. ([GitHub][6])

### Ox/Viem style inspiration

* Ox is a type-safe standard library with small modules (Bytes/Hex/etc.) intended to be used by higher-level consumers like Viem. ([GitHub][5])
* Viem is the high-level TS Ethereum interface; follow its compositional “actions/client” style. ([GitHub][7])

---

# 1) What to build (minimal end-to-end)

## User story

1. A partner (“business”) registers itself permissionlessly via **ERC-8004 Identity Registry** with an `agentURI`.
2. An **indexer** watches the registry and ingests:

   * the registration JSON
   * the business’s `/.well-known/ucp` URL (store snapshot)
3. A client searches the directory for a business, then uses **UCP Catalog** to:

   * `search_catalog` for items
   * `get_catalog_item` for a specific product/variant
4. Client picks a variant and runs **UCP checkout** where `line_items[].item.id = variant.id` (exact PR #55 bridge). ([GitHub][1])
5. On “complete checkout”:

   * authorize funds into **AuthCaptureEscrow**
   * store a linkage: `order_id <-> checkout_session_id <-> escrow_auth_id`
6. When an “order delivered” event occurs (simulate in local dev):

   * capture escrow
   * mint reward tokens to buyer (and optionally to business)
7. All this runs locally with a single `pnpm dev` (or similar).

---

# 2) Repo layout (Ox + Viem inspired)

Use a monorepo with `pnpm` + `turbo` (or Nx). Follow these conventions:

* `packages/*` = publishable libraries, small composable primitives (Ox-like).
* `apps/*` = runnable services/daemons.
* `contracts/*` = Foundry project(s).

## Proposed file tree

```
.
├─ apps/
│  ├─ directory-api/               # REST API: search businesses, list catalogs, order status
│  ├─ indexer/                     # watches ERC-8004 + crawls agentURI/ucp profile
│  ├─ ucp-agent/                   # CLI script: search->catalog->checkout->pay->simulate delivery
│  ├─ settlement-orchestrator/     # listens for order updates; triggers escrow capture + rewards
│  └─ ucp-business/                # local business server (use UCP Python sample; wrap w/ docs)
├─ packages/
│  ├─ core/                        # Ox-like primitives: Brand types, Hex/Bytes, ids, errors
│  ├─ schemas/                     # zod + JSON Schema for agent registration + DB models
│  ├─ erc8004-client/              # viem client + typed events + resolver for agentURI
│  ├─ ucp-client/                  # typed client for UCP profile + catalog + checkout endpoints
│  ├─ payments-client/             # viem client for AuthCaptureEscrow interactions
│  ├─ rewards-client/              # viem client for rewards token + distributor
│  └─ porto-sessions/              # interface-only: session/delegation policy objects
├─ contracts/
│  ├─ registry-erc8004/            # fork or vendor ERC-8004 IdentityRegistry (Foundry)
│  ├─ rewards/                     # ERC20 + RewardsDistributor + tests
│  └─ scripts/                     # deploy + seed scripts
├─ infra/
│  ├─ docker-compose.yml           # postgres, anvil, optional pgadmin
│  └─ migrations/
└─ turbo.json / pnpm-workspace.yaml
```

### Ox-like rules

* `packages/core/src/*` holds foundational modules (no side effects):

  * `core/src/Ids.ts` with branded ID types (`BusinessId`, `AgentId`, `CheckoutSessionId`, `EscrowAuthId`, etc.)
  * `core/src/Hex.ts`, `core/src/Bytes.ts`, `core/src/Errors.ts` (modeled after Ox’s small primitives). ([GitHub][5])
* Each package exports a clean public surface from `src/index.ts`.
* Use `src/internal/*` only when you must hide implementation details (Viem/Ox pattern).

### Viem-like rules

* Build composable “clients” in each package:

  * `createErc8004Client({ publicClient })`
  * `createPaymentsClient({ walletClient })`
  * use viem actions style (`readContract`, `writeContract`, typed ABIs). ([GitHub][7])

---

# 3) Contracts: minimal set

## 3.1 ERC-8004 Identity Registry (minimal)

* Use Identity Registry only (ERC-721 tokenId = agentId; tokenURI = agentURI).
* Deploy to Anvil.
* Emit `Transfer` is enough; also add a convenience event if present in reference.

## 3.2 Escrow

* Use Base Commerce Payments Protocol contracts locally (either:

  * vendor the relevant interface/ABI and deploy minimal subset, or
  * import as git submodule for local deployment).
* You need at minimum: `authorize` and `capture` paths consistent with “authorize/capture flow,” time-based expiries/amount limits. ([GitHub][3])

## 3.3 Rewards

* Implement:

  * `RewardsToken` (ERC20)
  * `RewardsDistributor` that mints/distributes on successful capture
* Take inspiration from Flywheel “allocate/distribute” style but keep it minimal: reward to buyer only at first. ([GitHub][4])

---

# 4) Offchain schemas (typed end-to-end)

## 4.1 Agent Registration JSON (stored at agentURI)

Define a `schemas/agentRegistration` Zod schema and publish JSON schema too.

Fields:

* `agentRegistry` (chain + registry address)
* `agentId` (tokenId)
* `business`:

  * `name`
  * `domain`
  * `ucpProfileUrl` (points to `https://{domain}/.well-known/ucp`)
* optional discovery feeds:

  * `locationsUrl` (NDJSON)
  * `offersUrl` (NDJSON)
* `payoutAddress` (EVM address)

This lets the indexer connect ERC-8004 registration to the UCP business profile.

## 4.2 DB models (Prisma)

Tables:

* `Business` (id, domain, name, createdAt)
* `Agent` (registryAddress, agentId, businessId, agentUri, verifiedAt)
* `UcpProfileSnapshot` (businessId, json, fetchedAt, etag, sha256)
* `CatalogItemCache` (businessId, variantId, productJson, fetchedAt) — optional
* `Order` (id, businessId, checkoutSessionId, escrowAuthId, status, totals, createdAt)
* `Escrow` (authId, state, amount, currency, expiresAt, txHashAuthorize, txHashCapture)

---

# 5) Services (apps)

## 5.1 `apps/indexer`

Responsibilities:

* Subscribe to ERC-8004 registry events on Anvil using Viem public client.
* For each new agentId:

  * resolve `agentURI` (tokenURI)
  * fetch JSON, validate schema
  * fetch `ucpProfileUrl` and store snapshot
* Re-ingest on schedule (e.g., every 15m) with conditional GET using ETag.

## 5.2 `apps/directory-api`

Responsibilities:

* Provide minimal endpoints:

  * `GET /businesses`
  * `GET /businesses/:id`
  * `GET /businesses/:id/catalog/search?q=...`
  * `GET /businesses/:id/catalog/item/:variantOrProductId`
* The catalog endpoints should call into `packages/ucp-client` (not cache by default in MVP).

## 5.3 `apps/ucp-agent` (CLI)

A single script to prove everything works:

1. list businesses
2. search catalog
3. choose first variant
4. create checkout
5. authorize escrow
6. simulate delivery
7. capture + mint rewards
8. print final balances

## 5.4 `apps/settlement-orchestrator`

Responsibilities:

* Listen to:

  * simulated “order delivered” events (for MVP, just HTTP POST)
  * later: UCP order webhooks (signed) once you wire them
* On delivery:

  * call escrow capture
  * call rewards distributor

---

# 6) UCP integration details (be specific)

## 6.1 Use official UCP samples server locally

Follow the official quickstart approach (clone + run python server). ([Google Developers Blog][2])

Provide these commands in your repo docs:

```bash
# UCP sample server + python sdk
mkdir -p external && cd external
git clone https://github.com/Universal-Commerce-Protocol/python-sdk.git ucp-python-sdk
git clone https://github.com/Universal-Commerce-Protocol/samples.git ucp-samples

cd ucp-samples/rest/python/server
uv sync
uv run server.py \
  --products_db_path=/tmp/ucp_test/products.db \
  --transactions_db_path=/tmp/ucp_test/transactions.db \
  --port=8182
```

(These are directly aligned with the official blog instructions.) ([Google Developers Blog][2])

## 6.2 Implement UCP Catalog client (PR #55)

In `packages/ucp-client` implement:

* `searchCatalog({ baseUrl, query, filters, context, cursor })`

  * calls `POST /catalog/search` ([GitHub][1])
* `getCatalogItem({ baseUrl, id })`

  * calls `GET /catalog/item/{id}` ([GitHub][1])

Hard requirements:

* Treat `variant.id` as the **purchase identifier** to pass to checkout: `item.id`. ([GitHub][1])
* Preserve `seller` when present (marketplace context), but do not require it. ([GitHub][1])
* Handle NOT_FOUND as HTTP 200 with an error message (match PR). ([GitHub][1])

## 6.3 Checkout bridge

In `apps/ucp-agent`, after selecting variant:

* Create checkout session (using UCP sample endpoints):

  * `line_items: [{ item: { id: <variant.id> }, quantity: 1 }]`
* Store `checkout_session_id`.

---

# 7) Payments + escrow bridge

## 7.1 Authorize on checkout completion

When user confirms checkout:

* call `AuthCaptureEscrow.authorize(...)` with:

  * `amount`
  * `payer` (agent user wallet)
  * `payee` (business payout address)
  * `expiry`
  * `order_ref` (hash of checkout_session_id + business domain)
* store `escrowAuthId` and tx hash

## 7.2 Capture on delivery

On “delivered”:

* call `AuthCaptureEscrow.capture(authId)`
* then `RewardsDistributor.distribute(order_ref, buyer, amount)` to mint.

Use Flywheel as conceptual inspiration but keep minimal state. ([GitHub][4])

---

# 8) Porto-style session/delegation (stub)

Create `packages/porto-sessions` that defines:

* `SessionPolicy` type:

  * allowed contract addresses
  * allowed selectors
  * max spend
  * expiry
* `SessionGrant` type:

  * policy + signature placeholder

Do **not** implement passkeys. This package exists so later you can replace “direct buyer wallet signature” with “delegated session signature” (Porto’s conceptual model). ([GitHub][6])

---

# 9) Local dev environment + scripts

## 9.1 Docker compose

* Postgres
* Anvil
* Optionally: pgadmin

## 9.2 Foundry scripts

`contracts/scripts/Deploy.s.sol` deploy:

* ERC-8004 IdentityRegistry
* RewardsToken + RewardsDistributor
* Commerce Payments contracts (or minimal subset)

## 9.3 Seed script

* mint/register one sample “business agent” with an `agentURI` pointing to a local file served by directory-api (or static file server)
* ensure indexer ingests it

---

# 10) Acceptance tests (must pass)

## End-to-end smoke test (single command)

`pnpm e2e` should:

1. start infra (anvil + postgres)
2. deploy contracts
3. run UCP sample business server (document manual step if needed)
4. register sample agent
5. indexer ingests agent + UCP profile
6. agent searches catalog and picks variant
7. agent creates checkout
8. agent authorizes escrow
9. simulate delivery
10. capture escrow
11. mint reward token to buyer
12. print:

    * buyer reward balance
    * escrow state
    * order status

---

# 11) Implementation notes (be strict)

* No `any`, no `any[]`. Use branded types for IDs and narrow types for schemas.
* Use Zod schemas at all network boundaries.
* For HTTP clients use `fetch` with typed wrappers.
* For Viem, use typed ABIs (generate types or inline `as const` ABIs).
* Keep packages tiny and composable.
* Write README per app with “why/what/how”.

---

# 12) Deliverables

Produce:

* full monorepo code
* `README.md` at root describing architecture + how to run locally
* `apps/*/README.md` with run instructions
* `docs/` folder:

  * `protocol-bridge.md`: how catalog -> checkout -> escrow -> rewards works
  * `threat-model.md`: minimal threats and mitigations
* working scripts: `pnpm dev`, `pnpm deploy`, `pnpm e2e`

**Start by implementing the “happy path” only.** Once the happy path works, add:

* marketplace `seller` propagation into UI results, ([GitHub][1])
* handling catalog NOT_FOUND semantics, ([GitHub][1])
* minimal dispute window in escrow (time-based reclaim), consistent with commerce-payments protections. ([GitHub][3])

[1]: https://github.com/Universal-Commerce-Protocol/ucp/pull/55 "feat(catalog): Catalog capability for product discovery by igrigorik · Pull Request #55 · Universal-Commerce-Protocol/ucp · GitHub"
[2]: https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/ "
            
            Under the Hood: Universal Commerce Protocol (UCP)
            
            
            \- Google Developers Blog
            
        "
[3]: https://github.com/base/commerce-payments "GitHub - base/commerce-payments: Onchain authorization and capture for trust-minimized commerce."
[4]: https://github.com/base/flywheel "GitHub - base/flywheel"
[5]: https://github.com/wevm/ox "GitHub - wevm/ox: Standard Library for Ethereum"
[6]: https://github.com/ithacaxyz/porto "GitHub - ithacaxyz/porto: Authentication & payments on the web"
[7]: https://github.com/wevm/viem "GitHub - wevm/viem: TypeScript Interface for Ethereum"
