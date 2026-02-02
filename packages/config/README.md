# @ucp/config

Shared configuration utilities for the UCP monorepo.

## Exports

```ts
import { loadEnvFiles } from "@ucp/config/env";
import { generateEnvSchemaFromTemplates } from "@ucp/config/env";
import { appRootFromCwd, repoRoot } from "@ucp/config/path";
```

### `@ucp/config/env`
- `loadEnvFiles({ repoRoot, appRoot? })` loads root `.env` then app `.env.local`.
- `generateEnvSchemaTemplate({ inputPath, outputPath, ... })` builds a schema from one template.
- `generateEnvSchemaFromTemplates({ templatePaths, outputPath, ... })` composes
  multiple templates into one schema.

### `@ucp/config/path`
- `repoRoot()` resolves the repo root from `process.cwd()`.
- `appRootFromCwd({ appPath })` resolves an app root under the repo.

## Generation

Apps should generate their env schema during install or dev by composing
the root `.env.template` with the app `.env.local.example`.

## Notes

- Scripts rely on repo root resolution, so run them from anywhere inside the repo.
- App env loading expects an explicit `appPath` (e.g. `apps/identity-indexer`).