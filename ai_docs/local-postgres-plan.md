## Local Postgres Access Plan (Monorepo)

### Goal
Provide a consistent way for host-run apps to connect to Postgres running in
Docker with simple, app-scoped overrides and no conditional logic in code.

### Guiding Principles
- Keep infra config at the repo root and app config scoped to each app.
- Use a single canonical DB connection variable per app (`DATABASE_URL`).
- Allow per-app overrides via `.env.local` (host) and `.env.docker` (container).
- Avoid conditional logic in application code; rely on env file selection.

### Proposed Repo Layout
```
/infra/
  .env.example          # compose interpolation values (committed)
/apps/
  identity-indexer/
    .env.example        # app env contract (committed)
    .env.local          # host-run overrides (gitignored)
    .env.docker         # container-run overrides (gitignored, optional)
```

### Infra Environment Contract
Infra uses only Postgres component vars:
```
POSTGRES_HOST=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=shovel
POSTGRES_PORT=5432
```

### App Environment Contract (Canonical)
Apps consume a single connection string:
```
DATABASE_URL=postgresql://user:pass@host:port/db
```

#### Host-run example (`.env.local`)
```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/shovel
```

#### Container-run example (`.env.docker`)
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/shovel
```

### Application Loading Behavior
Each app loads env in this order:
1. repo root `.env` (if present)
2. app `.env.local` (host)
3. app `.env.docker` (container; optional)

Later files override earlier ones. No runtime branching is required.

### Docker Compose Recommendation
Bind Postgres to localhost only:
```
ports:
  - "127.0.0.1:${POSTGRES_PORT}:5432"
```
This prevents exposing Postgres on the LAN.

### Identity Indexer Changes (Example)
- Use `DATABASE_URL` in `src/env.ts` and `src/db.ts`.
- Load app-level overrides from `.env` and `.env.local`.
- `generate:db-types` uses `DATABASE_URL` directly.

### Simple Final Standard (Adopt This)
1. **Infra** uses `POSTGRES_*` only.
2. **Compose** binds Postgres to localhost:
   `127.0.0.1:${POSTGRES_PORT}:5432`.
3. **Apps** require `DATABASE_URL`, supplied via app `.env.local`.
4. **App env loading** merges root `.env` then app overrides.
5. **No conditional logic** in app code.

### Rollout Steps
1. Add `.env.example` files for infra and each app.
2. Ensure apps load `.env` + `.env.local` overrides.
3. Switch app DB connections to `DATABASE_URL`.
4. Update docs to reflect the new env contracts.
5. Add `.env.local` and `.env.docker` to `.gitignore` if not present.
