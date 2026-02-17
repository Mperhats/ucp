Below is a tight “Phase 0 → Phase 1” starting plan, aligned to the current UCP
monorepo conventions (subtrees, root Makefile, and scripts).

---

## Phase 0 — Identity contracts + local Anvil + Foundry (Docker-first)

### A) Use the ERC-8004 Foundry repo as your baseline (subtree, not submodule)

The best starting point for IdentityRegistry (Foundry project structure + tests) is the **official reference implementation**, vendored as a **git subtree** (same pattern as `packages/js-sdk`, `packages/python-sdk`, etc.):

* `aadeexyz/erc-8004` — includes `IdentityRegistry.sol` plus interfaces/libraries/tests in a clean Foundry layout. ([GitHub][1])
* It’s explicitly **experimental and unaudited** (fine for devnet + local prototyping, but treat it as such). ([GitHub][1])

### B) Run Anvil + Foundry via docker-compose (repo pattern)

This repo uses Docker Compose with a stable Foundry image and an explicit
`anvil` entrypoint + healthcheck. This avoids startup races when the Foundry
runner connects to `http://anvil:8545`.

```yaml
# infra/docker-compose.yml (repo root)
services:
  anvil:
    image: ghcr.io/foundry-rs/foundry:stable
    container_name: anvil
    ports:
      - "8545:8545"
    entrypoint: ["anvil"]
    command:
      - --host
      - "0.0.0.0"
      - --port
      - "8545"
      - --chain-id
      - "31337"
      - --mnemonic
      - "test test test test test test test test test test test junk"
      - --balance
      - "1000000"
      - --block-time
      - "1"
      - --gas-limit
      - "30000000"
    healthcheck:
      test: ["CMD", "cast", "block-number", "--rpc-url", "http://127.0.0.1:8545"]
      interval: 1s
      timeout: 1s
      retries: 30
  foundry:
    image: ghcr.io/foundry-rs/foundry:stable
    container_name: foundry
    working_dir: /repo/contracts
    volumes:
      - ..:/repo
    entrypoint: ["bash", "-lc"]
    command: "sleep infinity"
    depends_on:
      anvil:
        condition: service_healthy
```

Run via Makefile:

```bash
make anvil
```

### C) “Modern Foundry + Docker” best reference

If you want a canonical “how to use Foundry inside Docker properly,” use Foundry’s guide **Running Foundry inside of Docker**. It covers:

* retagging the image for convenience,
* mounting a project directory and running `forge test`,
* building a Dockerfile that fails builds if tests fail,
* and launching Anvil via docker-compose. ([getfoundry.sh][2])

---

## Phase 1 — Add escrow-capable payments (later phase)

For Coinbase “Commerce contracts,” you have two distinct options:

See `ai_docs/coinbase-handler.md` for the handler design notes and flow.

### Option 1: Coinbase Commerce Onchain Payment Protocol (pay-now, settlement + conversion)

Repo: `coinbase/commerce-onchain-payment-protocol` — it’s explicitly an onchain payment protocol with published deployments and docs. ([GitHub][3])

This is best when you want:

* atomic settlement,
* optional conversion (payer pays any token, merchant receives exact token/amount),
* “pay now” flows.

### Option 2 (delivery-friendly): Base Commerce Payments Protocol (authorize/capture escrow)

Repo: `base/commerce-payments` — explicitly “authorize and capture” escrow patterns. ([GitHub][4])
This is better for delivery because you can **authorize** at checkout, and **capture** after fulfillment.

Given you said “escrow after checkout resolves funds,” you’ll likely end up using `base/commerce-payments` as the *escrow* layer even if you also support Coinbase’s pay-now rail.

---

## The links you asked for (copy/paste)

```text
ERC-8004 IdentityRegistry (Foundry):
- https://github.com/aadeexyz/erc-8004

Coinbase Commerce Onchain Payment Protocol:
- https://github.com/coinbase/commerce-onchain-payment-protocol

Base Commerce Payments Protocol (auth/capture escrow):
- https://github.com/base/commerce-payments

Foundry (toolchain + Dockerfile in repo):
- https://github.com/foundry-rs/foundry

Foundry Docker image (GHCR package):
- https://github.com/orgs/foundry-rs/packages/container/package/foundry

Foundry official guide: Running Foundry inside Docker (includes docker-compose Anvil snippet):
- https://getfoundry.sh/guides/foundry-in-docker/
```

(ERC-8004 repo reference: ([GitHub][1]), Coinbase Commerce repo reference: ([GitHub][3]), Foundry docker-compose snippet: ([getfoundry.sh][2]))

---

## UCP payment + checkout references (in repo)

Use these repo-local specs as the source of truth when defining handlers:

- `spec/docs/specification/payment-handler-guide.md`
- `spec/docs/specification/payment-handler-template.md`
- `spec/docs/specification/shopping/checkout.md`
- `spec/docs/specification/tokenization-guide.md`
- `spec/docs/specification/examples/coinbase-commerce-auth-capture-handler.md`

---

## Minimal “best practice” bootstrap layout (aligned to this monorepo)

Add a `contracts/` subtree while keeping existing `apps/` and `packages/` as-is:

```
  contracts/
  erc8004/                  # git subtree from aadeexyz/erc-8004
  infra/
  docker-compose.yml        # anvil
Makefile                    # add contract targets here
```

**Makefile additions (root)**

```make
anvil:
	./scripts/anvil_up.sh infra/docker-compose.yml detached

anvil-wait:
	docker compose -f infra/docker-compose.yml exec -T anvil \
	  cast block-number --rpc-url http://127.0.0.1:8545

test-erc8004:
	docker compose -f infra/docker-compose.yml run --rm foundry \
	  "cd /repo/contracts/erc8004 && forge test"

deploy-erc8004:
	docker compose -f infra/docker-compose.yml run --rm \
	  -e DEPLOYER_PRIVATE_KEY=... \
	  foundry "cd /repo/contracts/erc8004 && forge script script/DeployIdentityRegistry.s.sol:DeployIdentityRegistry \
	  --rpc-url http://anvil:8545 --broadcast"

seed-erc8004:
	docker compose -f infra/docker-compose.yml run --rm \
	  -e AGENT_PRIVATE_KEY=... -e AGENT_DOMAIN=... \
	  foundry "cd /repo/contracts/erc8004 && forge script script/SeedAgent.s.sol:SeedAgent \
	  --rpc-url http://anvil:8545 --broadcast"
```

The deploy script writes the registry address to:
`contracts/erc8004/broadcast/identity-registry.json`.

---

## What I’d do next (still “Phase 0” scope)

1. Add `aadeexyz/erc-8004` as a **git subtree** at `contracts/erc8004`. ([GitHub][1])
2. Add root Makefile targets for `anvil`, `test-erc8004`, `deploy-erc8004`.
3. Bring up Anvil via docker-compose. ([getfoundry.sh][2])
4. `forge test` + `forge script --broadcast` against Anvil.

Then we can move to Phase 1 (identity indexer + directory API) and wire the
registry into the offchain discovery flow.

[1]: https://github.com/aadeexyz/erc-8004 "GitHub - aadeexyz/erc-8004: This repository contains a reference implementation for ERC-8004: Trustless Agents"
[2]: https://getfoundry.sh/guides/foundry-in-docker/ "foundry - Ethereum Development Framework"
[3]: https://github.com/coinbase/commerce-onchain-payment-protocol "GitHub - coinbase/commerce-onchain-payment-protocol"
[4]: https://github.com/base/commerce-payments?utm_source=chatgpt.com "base/commerce-payments: Onchain authorization and ..."
