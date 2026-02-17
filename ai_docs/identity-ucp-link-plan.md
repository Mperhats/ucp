# Plan: Standardizing ERC-8004 → UCP Discovery Link

## Goal
Make the ERC-8004 registry, the indexer, and UCP discovery use a single,
predictable linking standard so local dev and hosted infra behave the same.

## Current State (Fractured)
- `SeedAgent.s.sol` registers `agent_uri` using `https://example.com/...`.
- The indexer expects `agent_uri` to resolve to JSON containing
  `business.ucpProfileUrl`.
- The sample UCP server serves `/.well-known/ucp` locally, but nothing points to
  it from the chain.
- Result: indexer drops rows because agent URIs are not resolvable/valid.

## Proposed Standard
### 1) Canonical Agent URI JSON (tokenURI)
`agent_uri` must resolve to a JSON object with these fields:
```json
{
  "version": "1.0",
  "registry": {
    "chainId": 31337,
    "contract": "0x...",
    "agentId": "1"
  },
  "business": {
    "name": "Example Merchant",
    "domain": "example.com",
    "ucpProfileUrl": "https://example.com/.well-known/ucp"
  }
}
```
Notes:
- `business.ucpProfileUrl` must be a valid UCP profile endpoint.
- `domain` is the canonical identity key for the directory/indexer.

### 2) Canonical Schema Location
Single source of truth for validation:
- Short term: `apps/identity-indexer/src/agent-uri.ts`
- Medium term: move to `packages/agent-uri` and import everywhere.

## Implementation Plan (Phased)
### Phase 1: Fix Seed + Local Discovery
- Update `SeedAgent.s.sol` to accept `AGENT_URI` (or `AGENT_URI_BASE`).
- Generate a dev agent JSON that points to the local sample server:
  - `http://localhost:3000/.well-known/ucp`
- Run the seed with a real `agent_uri` instead of `example.com`.

### Phase 2: Shared Schema
- Extract agent URI schema into a small package.
- Update indexer + tooling to import the shared schema.

### Phase 3: Directory API (optional)
- Expose `/businesses` from indexer-backed directory.
- Use `domain` as the primary key.

## Acceptance Criteria
1. Seed registers an agent with a resolvable `agent_uri`.
2. Indexer ingests events and returns ≥1 business.
3. `GET /businesses` includes `domain` + `ucpProfileUrl` + `discoveryJson`.
4. Local `/.well-known/ucp` matches UCP spec and validates.
