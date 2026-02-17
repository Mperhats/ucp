# Onchain Tooling Redundancy Audit

## Scope
- Node.js sample app runtime behavior.
- Infra/Makefile and Foundry deployment scripts.
- Local onchain payment simulation and seed data usage.

## Redundancy Map

| Area | Current Behavior | Redundancy | Impact |
| --- | --- | --- | --- |
| Funding & minting | `apps/samples/rest/nodejs/scripts/simulate-preapproval.ts` tops up ETH and mints tokens | Duplicates infra bootstrapping | Non-deterministic runs, flaky tests |
| Seed data | `apps/samples/rest/nodejs/scripts/seed-flower-shop.ts` reads conformance fixtures | Cross-package dependency | Fragile app portability |
| Payment flow | `apps/samples/rest/nodejs/src/api/checkout.ts` calls escrow directly | API layer owns chain logic | Tight coupling, harder tests |
| Account model | `apps/samples/rest/nodejs/src/_generated/env.ts` includes infra keys | Env schema mixes infra + app | Config drift and leakage |
| Deployment outputs | `scripts/deploy_commerce_payments.sh` and mock token script | Funding logic in runtime, not infra | Split ownership of state |

## Source-of-Truth Matrix

| Concern | Desired Source of Truth | Current Sources |
| --- | --- | --- |
| EOA derivation | Infra runbook + Foundry | `simulate-preapproval.ts`, env defaults |
| ETH funding | Infra targets | `simulate-preapproval.ts`, manual top-ups |
| Token minting | Foundry mock token deploy script | `simulate-preapproval.ts` |
| Address book | `packages/contracts/src/generated/addresses.ts` | Mixed env + script data |
| Seed data | App-local fixtures or explicit path | Conformance fixtures |

## Risk Assessment
- **Operational risk**: Local runs diverge from infra state, leading to silent failures.
- **Security risk**: Private keys appear in app env schemas and runtime defaults.
- **Maintenance risk**: Payment logic embedded in API layer creates duplication in future handlers.

## Recommendations (Docs-Only)
- Define an infra-first runbook for EOAs, funding, minting, and address outputs.
- Separate app runtime configuration from infra configuration.
- Make seed data ownership explicit and local to the sample app.
- Move payment flow logic into a dedicated handler service (documented only).

## Primary Files Reviewed
- `apps/samples/rest/nodejs/scripts/simulate-preapproval.ts`
- `apps/samples/rest/nodejs/scripts/seed-flower-shop.ts`
- `apps/samples/rest/nodejs/src/api/checkout.ts`
- `apps/samples/rest/nodejs/src/_generated/env.ts`
- `scripts/deploy_commerce_payments.sh`
- `scripts/deploy_commerce_mock_token.sh`
- `contracts/vendor/commerce-payments/script/Deploy.s.sol`
- `contracts/vendor/commerce-payments/script/DeployMockToken.s.sol`
