Yes — and the cleanest way is to treat Coinbase/Base contracts as **vendored libraries** under `/contracts/vendor`, then have **one Foundry “app” project** in `/contracts/protocol` that:

* imports ERC-8004 + Coinbase/Base contracts via **remappings**
* deploys them onto Anvil with scripts
* writes the deployed addresses into a local `deployments.json` (or `.env`)
* your infra (Shovel + Postgres) indexes those addresses

Below is a concrete “do this, then this” plan.

---

## 0) Decide which Coinbase stack you’re pulling in

You can pull in both, but start with one:

* **For delivery / escrow (authorize → capture):** `base/commerce-payments` ✅ (best fit)
* **For pay-now / conversion intent flows:** `coinbase/commerce-onchain-payment-protocol` (optional later)

---

## 1) Vendor the repos into your monorepo

### Option A: Git subtree (matches what you already did)

From your repo root:

```bash
# Base authorize/capture escrow protocol
git subtree add --prefix contracts/vendor/commerce-payments \
  https://github.com/base/commerce-payments.git main --squash

# Coinbase pay-now protocol (optional)
git subtree add --prefix contracts/vendor/commerce-onchain-payment-protocol \
  https://github.com/coinbase/commerce-onchain-payment-protocol.git main --squash
```

Update later with:

```bash
git subtree pull --prefix contracts/vendor/commerce-payments \
  https://github.com/base/commerce-payments.git main --squash
```

### Option B: Foundry-native `forge install` (works, but you said subtree)

You’d do this inside a Foundry project; it pulls into `lib/`. It’s fine, but subtree is consistent with your repo.

---

## 2) Create a single Foundry “protocol” project that imports everything

Make this folder:

```
contracts/protocol/
  foundry.toml
  remappings.txt
  src/
  script/
  test/
```

### `contracts/protocol/foundry.toml`

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
fs_permissions = [{ access = "read", path = "../" }]
```

### `contracts/protocol/remappings.txt`

Point imports at your vendor folders (adjust paths if needed):

```text
erc8004/=../erc-8004/src/
commerce-payments/=../vendor/commerce-payments/src/
coinbase-oppp/=../vendor/commerce-onchain-payment-protocol/src/
```

> The key idea: **do not run `forge` inside the vendored repos**. Treat them as libraries. Run `forge` only inside `contracts/protocol`.

---

## 3) Write a deploy script that deploys only what you need (Phase 0/1)

### Phase 0: deploy IdentityRegistry (ERC-8004)

`contracts/protocol/script/DeployIdentity.s.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import { IdentityRegistry } from "erc8004/IdentityRegistry.sol"; // adjust if filename differs

contract DeployIdentity is Script {
  function run() external returns (address registry) {
    vm.startBroadcast();
    IdentityRegistry r = new IdentityRegistry();
    registry = address(r);
    vm.stopBroadcast();
  }
}
```

### Phase 1: deploy escrow contracts (Commerce Payments)

You’ll typically deploy the minimal escrow + whatever “collector” you plan to support (Permit2 / ERC-3009 / preapproval). The exact constructors vary, so you’ll:

* inspect their repo’s deployment scripts
* port the minimal subset into *your* script

Start with a placeholder deploy script that **deploys escrow and prints addresses**; refine once you confirm constructors.

`contracts/protocol/script/DeployEscrow.s.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

// NOTE: Update these imports to match the commerce-payments repo structure.
import { AuthCaptureEscrow } from "commerce-payments/AuthCaptureEscrow.sol";

contract DeployEscrow is Script {
  function run() external returns (address escrow) {
    vm.startBroadcast();

    AuthCaptureEscrow e = new AuthCaptureEscrow(/* ctor args here */);
    escrow = address(e);

    vm.stopBroadcast();
  }
}
```

---

## 4) Wire this into your Docker Compose Foundry runner

You already have `anvil` + `foundry` in compose. The only requirement is:

* `foundry` container’s `working_dir` points at `/repo/contracts/protocol`
* `volumes` mounts the repo

Example `foundry` service:

```yaml
foundry:
  image: ghcr.io/foundry-rs/foundry:stable
  working_dir: /repo/contracts/protocol
  volumes:
    - ..:/repo
  entrypoint: ["bash", "-lc"]
  depends_on:
    anvil:
      condition: service_started
```

---

## 5) Makefile targets (deploy + capture addresses)

In your root `Makefile` (or `contracts/Makefile`), add:

```make
ANVIL_RPC=http://anvil:8545

forge-%:
	docker compose -f infra/docker-compose.yml run --rm foundry '$(*)'

anvil:
	docker compose -f infra/docker-compose.yml up -d anvil

deploy-identity: anvil
	$(MAKE) forge-forge\ script\ script/DeployIdentity.s.sol:DeployIdentity\ --rpc-url\ $(ANVIL_RPC)\ --broadcast\ -vvvv

deploy-escrow: anvil
	$(MAKE) forge-forge\ script\ script/DeployEscrow.s.sol:DeployEscrow\ --rpc-url\ $(ANVIL_RPC)\ --broadcast\ -vvvv
```

### Best practice: write deployment outputs to a file

Instead of scraping stdout, do this:

* In each deploy script, write JSON via `vm.writeJson` (Foundry supports this), e.g. `infra/deployments/local.json`.

Then your Shovel template can read addresses from `.env` / that JSON.

---

## 6) Update your infra so Shovel indexes multiple contracts

Once identity + escrow are deployed, you’ll have addresses like:

* `IDENTITY_REGISTRY_ADDRESS`
* `ESCROW_ADDRESS`

Then:

* add *another Shovel integration* per contract (or group addresses per ABI)
* each integration filters by `log_addr` (critical)

So your Shovel plan becomes:

* `infra/shovel/identity.template.json`
* `infra/shovel/escrow.template.json`
* or one `infra/shovel/local.template.json` with two integrations

---

## 7) How this connects back to UCP (payments as a UCP payment handler)

At this stage, you’re *only* pulling contracts + indexing. But your wiring goal is:

* business advertises a UCP payment handler like `com.coinbase.commerce.auth_capture`
* platform executes `authorize(...)` on `AuthCaptureEscrow`
* platform writes `payment.instruments[]` back into checkout

You don’t need that yet to get Phase 0/1 done — but this is why you want the escrow address in your indexed DB.

---

## Practical “minimum success” checklist for where you are now

1. `make anvil`
2. `make deploy-identity` (prints registry address)
3. put `IDENTITY_REGISTRY_ADDRESS` in `.env`
4. `make shovel-config && docker compose up shovel`
5. register 1 agent → confirm a row lands in Postgres

Then repeat for escrow contracts.

---

If you paste:

* the exact **file path** of `IdentityRegistry.sol` inside your subtree, and
* which Coinbase/Base repo you chose first (**commerce-payments** vs **commerce-onchain-payment-protocol**),

I’ll give you the **exact remappings + imports + deploy script** for that repo (with correct constructor args) and the corresponding Shovel integration events you should index first.
