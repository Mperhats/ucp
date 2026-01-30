# ERC-8004 Agent URI Spec

This directory defines the ERC-8004 agent registration file schema and related
documentation. It is intentionally separate from the UCP spec to avoid mixing
protocol standards.

## Layout
- `source/schemas/agent-uri.schema.json` — canonical JSON Schema source
- `spec/schemas/agent-uri.schema.json` — published schema (mirrors `source/`)
- `generate_ts_schema_types.js` — type generator (mirrors UCP spec tooling)
- `generated/schema-types.ts` — generated TypeScript types
- `scripts/generate_models.sh` — Zod type generator (quicktype)
- `generated/agent-uri.zod.ts` — generated Zod schema + types

## Agent URI Registration File
Per ERC-8004, `agentURI` must resolve to a registration JSON document. The
schema here standardizes that document so indexers and clients can reliably
validate it.

## UCP Discovery Integration (UCP Extension Notes)
This repository uses ERC-8004 `agentURI` as the canonical, on-chain entry point
for discovering UCP businesses. The UCP Discovery Profile lives at
`/.well-known/ucp` and MUST validate against the UCP profile schema
(`spec/spec/discovery/profile_schema.json`).

### Relationship to UCP Roles
UCP distinguishes **Platform** (consumer surface/agent) from **Business** (MoR).
For discovery, the ERC-8004 registry SHOULD index **Business** identities, and
Platforms SHOULD consume the registry for discovery rather than registering
themselves.

### Linking to UCP Profiles
The ERC-8004 schema is intentionally separate from the UCP spec. To link them
without extending the core schema, define a UCP endpoint in `endpoints[]`:

```jsonc
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Example Business",
  "description": "UCP-enabled business",
  "image": "https://example.com/logo.png",
  "endpoints": [
    {
      "name": "UCP",
      "endpoint": "https://merchant.example/.well-known/ucp",
      "version": "2026-01-11"
    }
  ],
  "active": true,
  "registrations": [
    {
      "agentId": 1,
      "agentRegistry": "eip155:1:0x742..."
    }
  ]
}
```

#### Requirements
- `endpoints` MUST include at least one entry with `name: "UCP"`.
- The `endpoint` MUST resolve to a valid UCP discovery profile.
- The UCP profile MUST validate against the schema at
  `spec/spec/discovery/profile_schema.json`.

### Extensions and Additional Properties
The ERC-8004 agent URI schema sets `additionalProperties: false` at the top
level. If you need UCP-specific extensions, add them under `endpoints[]` as
protocol-specific metadata (e.g., UCP capability tags) rather than adding new
top-level fields. This preserves compatibility with the canonical ERC-8004
schema and keeps UCP-specific concerns scoped to UCP endpoint entries.

### Type Generation Pipeline
The UCP repository generates types from JSON Schemas under `spec/spec/**`.
This ERC-8004 schema follows the same pipeline. To keep the UCP interface
stable, prefer linking via the UCP endpoint and validate profiles with the
UCP discovery schema. Any UCP-specific typing should live alongside the UCP
schemas, not in the ERC-8004 schema.

## Usage
Use the schema to validate `agentURI` JSON at ingestion time (indexers) and
generation time (seed scripts, registries, and test fixtures).

Generate TypeScript types:
```
pnpm -C erc8004 install
pnpm -C erc8004 run generate:ts
```

Generate Zod types:
```
pnpm -C erc8004 run generate:zod
```

## Notes
- This is not part of the UCP spec; it is an integration dependency.
- Keep fields aligned with ERC-8004 and add extensions sparingly.
