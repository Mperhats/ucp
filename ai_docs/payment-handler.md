# Coinbase Commerce handler (UCP)

In UCP, you “register” Coinbase Commerce (or any payment rail) by turning it into
a **UCP payment handler**.

UCP’s payment model is:

* The **business** returns a Checkout object that includes `payment.handlers`
  (what processors/flows are available).
* The **platform/agent** picks one handler, runs that handler’s flow to get an
  authorized payment “artifact,” and then fills `payment.instruments[]` with the
  collected instrument data.
* Handlers are modular and negotiated (not prescribed), so adding a “Coinbase
  Commerce” handler is exactly what the design is for.

Reference specs in this repo:

* `spec/docs/specification/payment-handler-guide.md`
* `spec/docs/specification/payment-handler-template.md`
* `spec/docs/specification/shopping/checkout.md`
* `spec/docs/specification/tokenization-guide.md`

---

## What you implement: a Coinbase Commerce payment handler spec + integration

### 1) Choose the handler namespace and flavor

You’ll likely support **two** related handlers, because Coinbase has two onchain
payment primitives:

**A) Escrow authorize/capture (best for delivery)**

* Backed by **Base Commerce Payments Protocol** (“authorize and capture” escrow,
  with protections).
* Handler name suggestion: `xyz.localprotocol.commerce.auth_capture`

**B) Pay-now / TransferIntent (best for instant settlement)**

* Backed by **coinbase/commerce-onchain-payment-protocol** (TransferIntent
  signed by operator; supports conversion).
* Handler name suggestion: `xyz.localprotocol.commerce.transfer_intent`.

---

## 2) How it appears in UCP Checkout (`payment.handlers`)

When the business creates the checkout session, it includes a handler entry like:

```json
{
  "payment": {
    "handlers": [
      {
        "id": "xyz_localprotocol_auth_capture",
        "name": "xyz.localprotocol.commerce.auth_capture",
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specs/commerce/auth_capture",
        "config_schema": "https://localprotocol.xyz/specs/commerce/auth_capture/config.json",
        "instrument_schemas": [
          "https://localprotocol.xyz/specs/commerce/auth_capture/instrument.json"
        ],
        "config": {
          "chainId": 8453,
          "escrowContract": "0xAuthCaptureEscrow...",
          "tokenCollectors": ["erc3009", "permit2"],
          "merchantPayoutAddress": "0xMerchant...",
          "authorizationExpirySeconds": 1800
        }
      }
    ]
  }
}
```

This aligns with the UCP pattern: the business declares what handlers are
available and provides enough configuration for the platform to execute the
flow. See `spec/docs/specification/payment-handler-guide.md` and
`spec/docs/specification/payment-handler-template.md`.

---

## 3) How the user authorizes (Coinbase Commerce / escrow version)

With the **authorize/capture escrow** model, “user authorization” usually means
**the user signs a spend authorization** (or approves a permit) and an operator
submits the onchain transaction.

So the handler flow is:

1. Platform chooses handler.
2. Platform requests a **payer authorization signature** for the chosen collector
   method (ERC-3009, Permit2, etc.).
3. Platform/operator calls `authorize(...)` on `AuthCaptureEscrow` using that
   signature to place funds in escrow.
4. Platform writes the resulting “instrument” into `payment.instruments[]`.

Example `payment.instruments[]` payload:

```json
{
  "payment": {
    "instruments": [
      {
        "handler": "xyz.localprotocol.commerce.auth_capture",
        "type": "onchain_escrow_authorization",
        "data": {
          "chainId": 8453,
          "escrowContract": "0xAuthCaptureEscrow...",
          "authorizationId": "0xabc123...",
          "authorizeTxHash": "0xdeadbeef...",
          "amount": { "amount": "29.87", "currencyCode": "USD" }
        }
      }
    ]
  }
}
```

---

## 4) Capture after delivery (how you make it work with UCP)

UCP itself doesn’t mandate escrow semantics, but it does standardize **order
lifecycle**. Your business (or marketplace) sends order updates; when the order
reaches “delivered/fulfilled,” you trigger capture.

So in practice:

* UCP order state transitions happen normally.
* Your settlement orchestrator listens for the “delivered” state and calls
  `capture(authorizationId)` on the escrow.
* Then you emit rewards, etc.

That’s why escrow is such a good fit for delivery: authorization at checkout,
capture at fulfillment.

---

## 5) The pay-now TransferIntent handler

If you implement the “pay-now” handler:

* The platform requests a **TransferIntent** from the operator (Coinbase
  Commerce), which includes merchant address, amount, chain, payer, deadline,
  refund destination, fee, etc.
* The operator signs it so it can’t be forged and so the operator can gate
  payments.
* The user authorizes by signing/approving the relevant transfer permission and
  the transaction executes.

Your `payment.instruments[]` would then include:

* `transferIntentId` (or hash)
* operator signature
* tx hash / receipt
* settlement metadata

---

## TL;DR “registration” answer

You don’t “register Coinbase Commerce with UCP” globally. You:

1. define a **UCP payment handler spec** for Coinbase Commerce (escrow and/or
   transfer-intent),
2. have businesses include that handler in `payment.handlers` on checkout
   creation,
3. implement the platform-side handler flow so the user authorizes
   (signature/permit), you execute the onchain authorize/capture or transfer-intent,
   and you return a `payment.instruments[]` record back into UCP.

If you want, we can draft the handler spec skeleton in the exact style of the
UCP payment handler guide and show the “happy path” request/response sequence
using `AuthCaptureEscrow` for delivery.
