# Seed Data Strategy

## Goals
- Keep sample app seeding self-contained.
- Avoid runtime coupling to conformance fixtures.
- Allow explicit overrides for local testing.

## Canonical Data Location
Preferred options:
1) **App-local fixtures** under `apps/samples/rest/nodejs/fixtures/`.
2) **Explicit path override** via `FLOWER_SHOP_DATA_DIR`.

The app should never default to `packages/conformance/test_data`.

## Seeding Rules
- Seeding script must use app-local defaults.
- If override is set, log the source path.
- Database output should remain within the app’s `databases/` directory.

## Migration Guidance (Docs Only)
- Copy required CSVs into app-local fixtures.
- Update seeding docs to describe default and override behavior.

## References
- `apps/samples/rest/nodejs/scripts/seed-flower-shop.ts`
