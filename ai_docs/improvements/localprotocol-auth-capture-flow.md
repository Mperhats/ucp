# Localprotocol Auth/Capture Flow (Spec)

## Scope
Defines the expected onchain flow for the `localprotocol_auth_capture` handler in the Node.js sample app. This is a behavioral spec only.

## Actors
- **Operator**: Facilitates onchain state transitions.
- **Buyer/Payer**: Provides authorization to spend.
- **Merchant/Receiver**: Receives capture proceeds.

## Preconditions
- Escrow contract and chosen collector are deployed.
- Buyer holds mock token and has approved collector.
- Operator has ETH for gas.
- Address book is available for current chain id.

## Flow Sequence

1) **Pre-approval**
   - Buyer calls collector `preApprove(paymentInfo)`.
   - Pre-approval must be mined before authorization.

2) **Authorize**
   - Operator calls escrow `authorize(paymentInfo, amount, tokenCollector, collectorData)`.
   - Escrow pulls tokens into the operator’s token store via collector.
   - Store `authorize_tx_hash` and `authorization_id` (hash) in the instrument.

3) **Capture**
   - Operator calls escrow `capture(paymentInfo, amount, feeBps, feeReceiver)`.
   - Funds released to receiver and fee receiver.

## PaymentInfo Requirements
Required fields:
- operator, payer, receiver, token
- maxAmount
- preApprovalExpiry, authorizationExpiry, refundExpiry
- minFeeBps, maxFeeBps, feeReceiver
- salt

## Collector Data
- `token_collector`: address of chosen collector (e.g., PreApproval).
- `collector_data`: collector-specific payload (currently `0x` for PreApproval).

## Error Handling Expectations
Common errors to surface clearly:
- `PaymentNotPreApproved`
- `InsufficientAuthorization`
- `InvalidSender`
- `AfterPreApprovalExpiry`
- `AfterAuthorizationExpiry`
- `TokenCollectionFailed`

## Integration Boundaries
- API should delegate onchain logic to a handler service.
- App runtime should not perform funding or minting.

## References
- `apps/samples/rest/nodejs/src/api/checkout.ts`
- `apps/samples/rest/nodejs/src/utils/escrow.ts`
