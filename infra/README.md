# Infra Quickstart

This is the minimal, current infra workflow.

## Requirements

- Docker (for Postgres, Anvil, Foundry)
- `pnpm` + `uv` if you run SDK or conformance tooling

## One-time setup

```
make env-init
```

You can pin Docker images by setting these in `.env`:

- `FOUNDRY_IMAGE` (Foundry/Anvil/Forge)

## Validate + generate (recommended)

```
make infra-check
```

This runs ABI builds (ERC-8004) and contract typegen.

Or run the full infra validation pipeline:

```
make infra-check
```

```
pnpm install
```

## Bring up infra

```
make infra-up
```

This boots Postgres + Anvil, deploys all ERC-8004 registries, and deploys the
payments escrow. ABI/typegen is not run in `infra-up`; use `make infra-check`
or `make generate-contracts` if you need to refresh generated types/addresses.

Infra services run on a shared `ucp` Docker network so app-level services
(like the identity indexer’s Shovel) can connect to `anvil`.

## Logs
```
make anvil-logs
```

## Register an agent

```
make register-agent
```

## Deploy registries only

Deploy each registry contract to the local Anvil chain. Use `deploy-registries`
to run all three.

```
make deploy-identity
make deploy-reputation
make deploy-validation
make deploy-registries
```

## Seed reputation + validation

Write sample data to the Reputation and Validation registries on Anvil.
Use `seed-erc8004` to run all three seeds (agent + reputation + validation).

```
make seed-reputation
make seed-validation
make seed-erc8004
```

## Register an agent (seed identity)

```
make register-agent
```

## Tear down

```
make infra-down
```

## Clean generated artifacts

```
make infra-clean
```
