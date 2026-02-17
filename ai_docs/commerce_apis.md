Plan to support your commerce use case
Goal: commerce schemas are generated, SDKs expose them, and conformance validates them.
1) Spec pipeline
Ensure spec/generate_schemas.py includes commerce in spec/spec/schemas/** (it already does).
Keep the auto‑enumeration for JS SDK (done).
2) JS SDK models
Already updated to auto‑include all schemas + all $defs.
Validate packages/js-sdk/src/spec_generated.ts includes:
commerce schemas (merchant/menu/checkout + type defs)
xyz.localprotocol.commerce.* types if present
3) Python SDK models
Verify the generated packages/python-sdk/src/ucp_sdk/models/schemas/commerce/**
If missing: check packages/python-sdk/generate_models.sh input roots and ensure it walks spec/spec/schemas/**.
4) Sample server
Add endpoints + handlers for new commerce capabilities in:
apps/samples/rest/python/server
Wire in schemas from ucp-sdk for request/response validation.
5) Conformance tests
Add a commerce test suite in packages/conformance/*_test.py:
Merchant discovery / search
Menu retrieval / search
Checkout with commerce line items + modifiers
Add test_data/commerce_* (CSV/JSON) to mirror your new flows.
6) CI / scripts
Update scripts/run_conformance.sh to include new commerce test data initialization.
Optionally add a make test:commerce target so you can isolate it.
If you want, I can:
Move ruff and fastapi-code-generator to dev dependencies (cleanup),
Add a commerce conformance test skeleton, and
Wire the sample server endpoints for commerce with Pydantic/Zod validation.
Tell me which piece you want to start with.