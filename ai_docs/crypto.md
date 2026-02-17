# Implementation Plan (phased, aligned to current UCP repo)

Goal: extend the existing UCP monorepo with identity-registry-backed discovery,
then progressively add catalog, checkout, escrow, and rewards.

## What already exists in this repo (keep, do not recreate)
* `spec/` with UCP schemas + docs (source of truth).
* `apps/samples` (upstream Python sample server).
* `packages/python-sdk`, `packages/js-sdk`, `packages/conformance` (subtrees).
* `Makefile` + `scripts/*` for spec generation, samples, and conformance.

## Canonical protocol references (local, authoritative)
* `spec/docs/specification/overview.md` (profiles, capability negotiation, UCP-Agent header, schema composition).
* `spec/docs/specification/identity-linking.md` (OAuth-based identity linking capability).
* `spec/docs/specification/shopping/catalog.md` (catalog semantics, NOT_FOUND messaging, variant id -> checkout item id).
* `spec/docs/specification/shopping/checkout.md`
* `spec/docs/specification/shopping/order.md`

## Constraints (updated to current structure)
* Keep upstream subtrees intact; add new code only under owned `apps/*` and `packages/*`.
* TypeScript for new services and libraries; Python only where the upstream samples already exist.
* Follow UCP capability/profile rules (namespace binding, schema resolution, UCP-Agent header).
* Keep local dev runnable from repo root using existing Makefile + scripts.

---

# 0) External references (still valid)
* UCP Catalog PR #55 for historical context and the variant id bridge. ([GitHub][1])
* UCP “Under the Hood” flow (still useful for sample-server context). ([Google Developers Blog][2])
* Base Commerce Payments Protocol (authorize/capture escrow). ([GitHub][3])
* Base Flywheel (rewards pattern). ([GitHub][4])
* Ox + Viem style references for TS clients (optional for new packages). ([GitHub][5], [GitHub][7])
* Porto inspiration for session/delegation (interface only). ([GitHub][6])

---

# 1) Target outcome (minimal end-to-end)
1. A business registers in an **ERC-8004 Identity Registry** with an `agentURI`.
2. An **indexer** ingests `agentURI` JSON and snapshots the business profile at
   `/.well-known/ucp`.
3. A directory client discovers businesses and queries **UCP Catalog**.
4. A client creates a checkout session using `variant.id` as `line_items[].item.id`.
5. Later phases add escrow authorize/capture and rewards on delivery.

---

# 2) Repo layout (current + new additions)

Keep the existing subtree structure. Add new code only under owned `apps/*` and
`packages/*`.

**Existing (do not change):**
```
spec/
apps/samples/
packages/js-sdk/
packages/python-sdk/
packages/conformance/
```

**New (owned):**
```
apps/identity-indexer/        # watches ERC-8004 + resolves agentURI + UCP profile
apps/directory-api/           # REST API for discovery + catalog proxy
apps/ucp-agent-cli/           # CLI flow: discover -> catalog -> checkout
packages/erc8004-client/      # viem client + typed events + tokenURI resolver
packages/registry-schemas/    # zod schema for agentURI JSON
packages/ucp-client/          # typed client for profile + catalog + checkout
```

In-repo contracts now:
```
contracts/erc8004/            # ERC-8004 registry subtree (deployed via Makefile)
```

Planned additions:
```
contracts/vendor/commerce-payments/  # Base Commerce Payments Protocol (auth/capture)
contracts/vendor/commerce-onchain-payment-protocol/  # Coinbase TransferIntent (pay-now)
```

Infra:
```
infra/                        # local anvil + docker compose
```

---

# 3) Phased approach (start with the basics)

## Phase 0: Align with current repo (already done)
* Spec + docs under `spec/` (authoritative).
* Upstream SDKs + samples as subtrees.
* Orchestration via `Makefile` + `scripts/*`.

## Phase 1: Identity registry + protocol-compatible discovery (first priority)
**Goal:** ingest ERC-8004 registrations and expose UCP-compatible business
profiles for discovery.

**Protocol compatibility requirements (from `spec/docs/specification/overview.md`):**
* Business profile must live at `/.well-known/ucp`.
* `ucp.version` must match the protocol version in the spec (current `2026-01-11`).
* Each capability must include `name`, `version`, `spec`, `schema`, and the
  `spec` origin must match the namespace authority.
* Catalog must follow `dev.ucp.shopping.catalog` semantics, including
  `variant.id` used as checkout item id and NOT_FOUND reported via `messages`.
* Platform requests must advertise their profile via `UCP-Agent` header.

**Minimum components:**
* `contracts/erc8004` (or external deployment): ERC-721 tokenId as agentId,
  `tokenURI` = `agentURI` JSON.
* `packages/registry-schemas`: zod schema for `agentURI` JSON, including:
  `agentRegistry`, `agentId`, `business { name, domain, ucpProfileUrl }`,
  optional discovery feeds, and `payoutAddress`.
* `apps/identity-indexer`: watches registry events, resolves `agentURI`, validates
  JSON, snapshots `/.well-known/ucp` profile, stores indexed rows.
* `apps/directory-api`: read-only API for listing businesses and proxying catalog
  calls to each business’s UCP endpoint.

### Current seed flow + gap
The current seed script only registers `agentDomain` + `agentAddress` on the
IdentityRegistry (no `agentURI` is recorded onchain). This is a gap vs the plan
that expects `tokenURI`/`agentURI` JSON. If you want Phase 1 to match this plan,
you will need one of:

- Add `agentURI` storage and an event to the registry (or a companion contract),
  then update the seed script to set it.
- Store `agentURI` offchain keyed by `agentId` and have the indexer resolve it
  from a trusted registry/database instead of the chain.

Recommended seed inputs (current contract):
- `AGENT_PRIVATE_KEY` (used to broadcast)
- `AGENT_DOMAIN` (registered domain string)
- Onchain deployment artifacts for `IdentityRegistry` (used to resolve address)

Recommended seed inputs (if you add agentURI):
- `AGENT_URI` (JSON URL or IPFS gateway URL)

**Suggested API surface (directory):**
  * `GET /businesses`
  * `GET /businesses/:id`
  * `GET /businesses/:id/catalog/search?q=...`
* `GET /businesses/:id/catalog/item/:id`

## Phase 2: Catalog discovery (UCP Catalog)
* Implement `packages/ucp-client` for:
  * `searchCatalog` → `POST /catalog/search`
  * `getCatalogItem` → `GET /catalog/item/{id}`
* Ensure NOT_FOUND returns HTTP 200 with an error message (catalog spec).
* Preserve marketplace context via `seller` when provided.

## Phase 3: Checkout + order lifecycle
* Use the sample server (`apps/samples/rest/python/server`) for real flows.
* Bridge catalog variants to checkout `line_items[].item.id`.
* Add `order` updates later via the order capability.

## Phase 4: Escrow authorize/capture + rewards
* Integrate Base Commerce Payments Protocol (authorize/capture).
* Mint rewards on capture (Flywheel-inspired minimal distributor).

## Phase 5: Session/delegation stub
* Add a small package with session policy types (Porto-inspired).

---

# 4) Identity registry compatibility (what it looks like first)

**AgentURI JSON (stored at `tokenURI`):**
* Must point to the business’s UCP profile in `business.ucpProfileUrl`.
* Should include registry and chain metadata so the indexer can verify origin.

**UCP profile requirements (business side):**
* Host at `/.well-known/ucp`.
* Include `services.dev.ucp.shopping.rest.endpoint`.
* Include `capabilities` with `dev.ucp.shopping.catalog` (draft) and
  `dev.ucp.shopping.checkout`.
* Ensure `spec` URLs match the namespace origin (`https://ucp.dev/...`).

**Indexer responsibilities:**
* Validate the `agentURI` JSON schema.
* Fetch and snapshot `/.well-known/ucp`.
* Validate capability namespace binding and store a normalized record.

**Directory API responsibilities:**
* Serve aggregated business list and detail view.
* Proxy catalog calls to each business’s UCP endpoint (no caching at first).

---

# 5) Services (apps) by phase

**Phase 1:**
* `apps/identity-indexer` (registry → agentURI → UCP profile snapshot).
* `apps/directory-api` (business discovery + catalog proxy).

**Phase 2:**
* `apps/ucp-agent-cli` (discover → catalog → checkout).

**Phase 4+:**
* `apps/settlement-orchestrator` (delivery event → capture → rewards).

---

# 6) UCP integration details (updated)

## 6.1 Use the in-repo sample server
* Run `make run-samples-server` (wraps the upstream Python server).
* Use `apps/samples/rest/python/server` as the checkout target in early phases.

## 6.2 Catalog bridge
* Use `variant.id` as checkout `line_items[].item.id`.
* Preserve `seller` when present.
* Handle NOT_FOUND via HTTP 200 + `messages` error (catalog spec).

## 6.3 Checkout bridge
* Create checkout session using the sample server’s REST endpoint.
* Store `checkout_session_id` alongside registry + business info.

---

# 7) Payments + escrow bridge (later phase)
* Authorize on checkout completion, capture on delivery.
* Use `order_ref` as a stable hash of `checkout_session_id + business.domain`.
* Mint rewards on capture (Flywheel-inspired, minimal).

---

# 8) Identity linking (do not conflate with ERC-8004)
UCP Identity Linking is OAuth 2.0 (`dev.ucp.common.identity_linking`), and is
orthogonal to onchain registry discovery. Keep it out of Phase 1; add it only
if the business requires user-account linkage for checkout or loyalty.

---

# 9) Local dev environment + scripts (updated)
* Keep using `make run-samples-server` for the Python sample.
* Add optional scripts for Anvil + registry deployment if onchain phase begins.
* Add a seed script to register a sample agent and trigger indexing.

---

# 10) Acceptance tests (phased)

**Phase 1 smoke test:**
1. Deploy ERC-8004 (or point to a local deployment).
2. Register one agent with `agentURI`.
3. Indexer ingests agent + UCP profile.
4. Directory API lists the business.

**Phase 2 smoke test:**
5. Search catalog.
6. Fetch catalog item by variant id.

**Phase 3+ smoke test:**
7. Create checkout.
8. (Later) authorize + capture escrow and mint rewards.

---

# 11) Implementation notes (be strict)
* No `any`, no `any[]`. Use branded types for IDs and narrow types for schemas.
* Use zod schemas at all network boundaries.
* For HTTP clients use `fetch` with typed wrappers.
* For Viem, use typed ABIs (generate types or inline `as const` ABIs).
* Keep packages small and composable.
* Write README per app with “why/what/how”.

---

# 12) Deliverables (phased)
* Phase 1: indexer + directory API + registry schema + seed script.
* Phase 2: catalog client + CLI demo.
* Phase 3+: checkout, escrow, rewards, and orchestration.

**Start with the happy path only.** After that, add:
* marketplace `seller` propagation into results.
* NOT_FOUND handling in catalog responses.
* minimal dispute window in escrow (time-based reclaim).

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
