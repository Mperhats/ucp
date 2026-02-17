# Local Environment & Account Model

## Goals
- Separate infra-only configuration from app runtime configuration.
- Ensure deterministic account roles for local testing.

## Environment Variable Classes

### Infra-only
Owned by Makefile/Foundry scripts, not the app:
- `ANVIL_MNEMONIC`
- `ANVIL_DEPLOYER_KEY`
- `ANVIL_BUYER_KEY`
- Funding/minting amounts

### App runtime
Used by the Node.js sample server:
- `ESCROW_RPC_URL`
- `CHAIN_ID`
- Optional overrides for address book lookup

## Account Role Mapping (Deterministic)

| Index | Role | Description |
| --- | --- | --- |
| 0 | Deployer/Funder | Deploys contracts and funds other EOAs |
| 1 | Operator | Submits authorize/capture |
| 2 | Merchant | Receiver of captured funds |
| 3 | Buyer | Payer and token holder |

## Address Book Usage
The app should read addresses from:
- `packages/contracts/src/generated/addresses.ts`

No runtime funding or minting should occur in the app.

## Known Problem Areas
- Mixing infra keys into `apps/samples/rest/nodejs/src/_generated/env.ts`.
- Funding or minting inside `simulate-preapproval.ts`.

## References
- `apps/samples/rest/nodejs/src/_generated/env.ts`
- `apps/samples/rest/nodejs/src/env.ts`
- `apps/samples/rest/nodejs/scripts/simulate-preapproval.ts`
