# Infra Onchain Bootstrapping Runbook

## Purpose
Define a deterministic, infra-owned process to stand up local onchain dependencies for the sample app. The app should never fund wallets or mint tokens.

## Responsibilities

### Infra owns
- Chain lifecycle (Anvil start/stop).
- Contract deployments (escrow + collectors + mock token).
- EOA funding (operator, buyer, merchant).
- Token minting to buyer.
- Address book generation.

### App owns
- Reading address book and RPC URL.
- Submitting authorize/capture transactions.
- No account funding or minting.

## Deterministic Account Policy
Use one mnemonic for all EOAs. Assign fixed indices:
- **Index 0**: Deployer/funder
- **Index 1**: Operator (platform)
- **Index 2**: Merchant
- **Index 3**: Buyer

This policy should be documented and enforced in infra scripts.

## Bootstrapping Steps

1) **Start chain**
- `make anvil`

2) **Deploy registries + escrow + collectors**
- `make deploy-registries`
- `make deploy-commerce-payments`

3) **Deploy mock token and mint to buyer**
- `make deploy-commerce-mock-token`

4) **Generate address book**
- `make generate-contracts`

5) **Verify artifacts**
- Confirm escrow + collector addresses exist in `packages/contracts/src/generated/addresses.ts`.
- Confirm mock token address present.

## Runtime Inputs for the App
- `ESCROW_RPC_URL` (local Anvil URL)
- `CHAIN_ID`
- Address book output

## Infra Script Review References
- `Makefile`
- `scripts/deploy_commerce_payments.sh`
- `scripts/deploy_commerce_mock_token.sh`
- `contracts/vendor/commerce-payments/script/Deploy.s.sol`
- `contracts/vendor/commerce-payments/script/DeployMockToken.s.sol`

## Validation Checklist
- Operator account has ETH.
- Buyer account has ETH + mock token balance.
- Escrow + collector contracts are deployed and discoverable.
- Address book matches the chain id.
