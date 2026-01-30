<!--
  Copyright 2026 UCP Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

# Type Generation Toolchain

This document describes the end-to-end toolchain for generating Python
Pydantic models and TypeScript Zod types from UCP JSON Schemas. It also
covers the auxiliary TypeScript interface generator used by the spec repo.

## Source of Truth

All type generation starts from JSON Schemas in `spec/source/`:

- `spec/source/schemas/**` for capability, component, and type schemas
- `spec/source/services/**` for transport specs (OpenAPI/OpenRPC)
- `spec/source/discovery/**` and `spec/source/handlers/**` for meta schemas

Schema authoring conventions are documented in
`spec/docs/documentation/schema-authoring.md`.

## Step 1: Build the Spec Artifacts

`spec/generate_schemas.py` transforms the source schemas into a normalized,
versioned spec in `spec/spec/`. This step is required before any SDK or
language-specific generation.

Key behaviors:

- **Annotation splitting**: schemas with UCP annotations (`ucp_request`,
  `ucp_response`) are split into `*.create_req.json`, `*.update_req.json`,
  and `*_resp.json`.
- **Ref rewriting**: `$ref` pointers are rewritten to reference the correct
  request/response variants.
- **Embedded/OpenAPI processing**: Embedded Protocol OpenRPC is generated,
  and service OpenAPI files are adjusted to reference split schemas.

Run it:

```bash
cd spec
python generate_schemas.py
```

Outputs:

- `spec/spec/schemas/**` (JSON Schema)
- `spec/spec/services/**` (OpenAPI/OpenRPC)
- `spec/spec/discovery/**`, `spec/spec/handlers/**`

## Step 2A: Python SDK (Pydantic v2)

The Python SDK is a generated model package in `packages/python-sdk`.

Generation entrypoint:

- `packages/python-sdk/generate_models.sh`

Tooling:

- `uv` for dependency/runtime management
- `datamodel-code-generator` to emit Pydantic v2 models
- `ruff` formatters for generated code

Command:

```bash
cd packages/python-sdk
uv sync
./generate_models.sh
```

Inputs:

- `spec/spec/**` if present
- fallback: `spec/**` (legacy path)

Outputs:

- `packages/python-sdk/src/ucp_sdk/models/**`
  - `schemas/` (shopping, restaurant, ucp, capability, etc.)
  - `services/` (OpenRPC/OpenAPI model holders)
  - `discovery/` and `handlers/` models

Notable flags from `generate_models.sh`:

- `--output-model-type pydantic_v2.BaseModel`
- `--use-schema-description` and `--use-field-description`
- `--field-constraints` (regex/min/max)
- `--enum-field-as-literal all`
- `--allow-extra-fields`

## Step 2B: TypeScript Zod Types (JS SDK)

The TypeScript Zod types live in `packages/js-sdk/src/spec_generated.ts`.

Generation entrypoint:

- `packages/js-sdk/generate_models.sh`

Tooling:

- `quicktype` with `--lang typescript-zod`

Command:

```bash
cd packages/js-sdk
./generate_models.sh /path/to/ucp/spec/spec
```

Inputs:

- All JSON schemas under `spec/spec/schemas/**` and `spec/spec/discovery/**`.
- All `$defs` discovered in those schema files (auto-enumerated).

Output:

- `packages/js-sdk/src/spec_generated.ts`

Notes:

- The script enumerates multiple `$defs` via `--src ...#/$defs/...` to ensure
  specific nested types are surfaced in the output.
- The generated file is the canonical TypeScript Zod schema bundle for the
  JS SDK.

## Step 2C: TypeScript Interfaces for Spec (Auxiliary)

The spec repo also generates TypeScript interfaces for documentation and
tooling, independent of the JS SDK.

Generation entrypoint:

- `spec/generate_ts_schema_types.js`

Tooling:

- `json-schema-to-typescript`

Command:

```bash
cd spec
node generate_ts_schema_types.js
```

Inputs:

- All schemas under `spec/spec/schemas/**`
- All handler schemas under `spec/spec/handlers/**`

Output:

- `spec/generated/schema-types-core.ts`
- `spec/generated/schema-types-shopping.ts`
- `spec/generated/schema-types-restaurant.ts`
- `spec/generated/schema-types-delivery.ts`
- `spec/generated/schema-types-discovery.ts`
- `spec/generated/schema-types-handlers.ts`

Notes:

- The script wraps all schemas in a synthetic root schema to drive
  `json-schema-to-typescript`, then removes the wrapper interface.
- It also cleans `$ref`-containing objects to avoid duplicate interface
  conflicts.

## End-to-End Flow Summary

1. **Author schemas** in `spec/source/**`.
2. **Build spec artifacts** with `spec/generate_schemas.py` into `spec/spec/**`.
3. **Generate Python models** with `packages/python-sdk/generate_models.sh`.
4. **Generate TS Zod types** with `packages/js-sdk/generate_models.sh`.
5. **Generate TS interfaces (spec tooling)** with
   `spec/generate_ts_schema_types.js`.

## Quick Reference

- Python SDK output: `packages/python-sdk/src/ucp_sdk/models/**`
- TS Zod output: `packages/js-sdk/src/spec_generated.ts`
- Spec TS interfaces:
  - `spec/generated/schema-types-core.ts`
  - `spec/generated/schema-types-shopping.ts`
  - `spec/generated/schema-types-restaurant.ts`
  - `spec/generated/schema-types-delivery.ts`
  - `spec/generated/schema-types-discovery.ts`
  - `spec/generated/schema-types-handlers.ts`

## Troubleshooting

- If generated models are stale, ensure `spec/spec/` was regenerated after
  schema edits.
- For Zod types, pass the correct spec directory to
  `packages/js-sdk/generate_models.sh`.
- For Python models, ensure `uv` is installed and `uv sync` succeeds before
  running the generator.
