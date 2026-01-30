## Env Strategy Specification

### Goals
- Single source of truth for infra defaults at repo root.
- App-specific local overrides.
- Clear, consistent file naming.

### File Naming Standard
- **Root**: `.env.template` (committed; infra defaults)
- **Apps**: `.env.local.example` (committed; local override template)
- **Local values**: `.env` and `.env.local` (never committed)

### Loading Order
Apps should load environment variables in this order:
1. Root `.env` (if present)
2. App `.env.local`

Later files override earlier ones.

### Runtime vs Schema
- Runtime values are loaded from `.env` and app `.env.local`.
- Types/schema are generated from templates: root `.env.template` +
  app `.env.local.example`.
