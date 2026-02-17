# Onchain Payment Handler: Best Approach, Gaps, and Next Steps

## Recommendation
**Use Option A: extend the handler instrument schema to carry the minimum data needed
to reconstruct `PaymentInfo` and execute `authorize`/`capture` onchain.**

Why this is best for your repo right now:
- **Self-contained:** no server-side state or pre-flight storage is required.
- **Conformance-friendly:** the instrument contains everything to validate and act on
  authorization without additional API calls.
- **Aligned with UCP handler model:** handler-specific fields belong in the handler's
  instrument schema; no core UCP extension required.
- **Easiest to test:** you can drive the full flow with a single `complete` request
  and a later `simulate-shipping` capture.

Option B (server-side stored `PaymentInfo`) is viable, but it adds:
- a new preflight API
- server-side persistence
- extra error cases (partial state, replays)
- more work to make conformance tests deterministic

## Current Gaps

### 1) Instrument lacks onchain execution inputs
Your `localprotocol_auth_capture` instrument currently carries proof-of-authorization
fields only:
- `authorization_id`
- `authorize_tx_hash`
- `chain_id`
- `escrow_contract`

**Missing for actual onchain calls:**
- `payer` (address)
- `token` (ERC-20 address)
- `amount` (authorized amount)
- `operator` (platform/operator address)
- `fee` config (min/max/receiver if used)
- `expiry` timestamps (pre-approval, authorization, refund)
- `salt` (for `PaymentInfo` hash uniqueness)
- `token_collector` + `collector_data` (ERC-3009 / Permit2 payload)

Without these, the sample app cannot call `authorize(...)` or `capture(...)`.

### 2) Node sample uses mock-only payment processing
- `completeCheckout` validates the instrument but does not call the escrow contract.
- `shipOrder` does not capture funds.

### 3) Sample has no chain config or signer
- Missing env vars for RPC URL, escrow address, operator key, fee receiver, etc.
- No `viem` client wiring in the Node sample.

## How to Proceed (Step-by-Step)

### Step 1: Extend the handler instrument schema
Update `spec/spec/handlers/localprotocol_auth_capture/instrument.json` to include
the minimum onchain fields required to build `PaymentInfo`:

Required additions (recommended):
- `payer`
- `token`
- `amount`
- `operator`
- `pre_approval_expiry`
- `authorization_expiry`
- `refund_expiry`
- `min_fee_bps`
- `max_fee_bps`
- `fee_receiver`
- `salt`
- `token_collector`
- `collector_data`

This keeps the handler self-contained and avoids server-side storage.

### Step 2: Update the Node sample instrument schema
Mirror the updated handler schema in:
- `apps/samples/rest/nodejs/src/models/extensions.ts`

Add the new fields to `LocalprotocolAuthCaptureInstrumentSchema` and the sample’s
`ExtendedPaymentDataSchema`.

### Step 3: Add onchain config and viem client
Introduce env vars (documented in README or `.env`):
- `ESCROW_RPC_URL`
- `ESCROW_CONTRACT_ADDRESS`
- `ESCROW_OPERATOR_PRIVATE_KEY`
- `ESCROW_FEE_RECEIVER` (optional)

Add a small helper (e.g. `src/utils/escrow.ts`) that:
- creates a `publicClient` + `walletClient`
- exposes `authorizeEscrow(...)` and `captureEscrow(...)`

### Step 4: Authorize on checkout completion
In `completeCheckout`, when `handler_id === localprotocol_auth_capture`:
- parse the instrument
- build a `PaymentInfo` struct
- call `authorize(...)` on `AuthCaptureEscrow`

Fail checkout if the onchain call fails.

### Step 5: Capture on fulfillment
On `/testing/simulate-shipping/:id`:
- reconstruct the same `PaymentInfo`
- call `capture(...)` for the authorized amount

This matches the handler spec (capture on fulfillment).

### Step 6: Test end-to-end locally
1. Start anvil
2. Deploy `AuthCaptureEscrow` (already in vendor repo)
3. Fund payer + approve/permit token
4. POST `/checkout-sessions`
5. POST `/checkout-sessions/:id/complete` with full instrument
6. POST `/testing/simulate-shipping/:id`

## Summary
You do **not** need a core UCP extension. The **handler instrument** is the right
place to carry onchain details. The sample app needs:
- richer instrument fields
- onchain client wiring
- authorize + capture calls

If you want, I can draft the exact JSON schema changes and the Node sample code
for `authorize` + `capture` calls against `AuthCaptureEscrow`.