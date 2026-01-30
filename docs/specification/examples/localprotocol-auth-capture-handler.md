<!--
   Copyright 2026 UCP Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
-->

# Localprotocol Commerce Auth/Capture Payment Handler

* **Handler Name:** `xyz.localprotocol.restaurant.auth_capture`
* **Version:** `2026-01-11`

## Introduction

This handler enables escrow-style authorize/capture payments using Coinbase
Commerce-compatible flows. It is designed for delivery-friendly commerce where
funds are authorized at checkout and captured upon fulfillment.

### Key Benefits

- Authorize now, capture later (delivery-friendly).
- Supports token-based authorization mechanisms (e.g., ERC-3009, Permit2).
- Compatible with UCP `payment.handlers` and `payment.instruments` model.

### Integration Guide

| Participant | Integration Section |
|:------------|:--------------------|
| **Business** | [Business Integration](#business-integration) |
| **Platform** | [Platform Integration](#platform-integration) |

---

## Participants

| Participant | Role | Prerequisites |
|:------------|:-----|:--------------|
| **Business** | Advertises handler config, captures after fulfillment | Yes |
| **Platform** | Selects handler, acquires authorization instrument | Yes |
| **Escrow Protocol** | Authorize/capture escrow contract | Yes |

---

## Business Integration

### Prerequisites

Before advertising this handler, businesses **MUST** complete:

1. Deploy or register an AuthCaptureEscrow contract address.
2. Provision payout addresses and decide supported token collectors.

**Prerequisites Output:**

| Field | Description |
|:------|:------------|
| `merchant_payout_address` | Address for captured funds |
| `escrow_contract` | AuthCaptureEscrow contract address |

### Handler Configuration

Businesses advertise support for this handler in the checkout's
`payment.handlers` array.

#### Configuration Schema

**Schema URL:** `https://ucp.dev/handlers/localprotocol_auth_capture/config.json`

#### Example Handler Declaration

```json
{
  "payment": {
    "handlers": [
      {
        "id": "localprotocol_auth_capture",
        "name": "xyz.localprotocol.restaurant.auth_capture",
        "version": "2026-01-11",
        "spec": "https://github.com/base/commerce-payments",
        "config_schema": "https://ucp.dev/handlers/localprotocol_auth_capture/config.json",
        "instrument_schemas": [
          "https://ucp.dev/handlers/localprotocol_auth_capture/instrument.json"
        ],
        "config": {
          "chain_id": 8453,
          "escrow_contract": "0xAuthCaptureEscrow",
          "token_collectors": ["erc3009", "permit2"],
          "merchant_payout_address": "0xMerchantPayout",
          "authorization_expiry_seconds": 1800,
          "environment": "sandbox"
        }
      }
    ]
  }
}
```

### Processing Payments

Upon receiving a payment with this handler's instrument, businesses **MUST**:

1. **Validate Handler:** Confirm `instrument.handler_id` matches the handler `id`.
2. **Validate Authorization:** Verify the authorization is valid and unexpired.
3. **Capture on Fulfillment:** Call capture on the escrow contract when order
   reaches a captured state.
4. **Return Response:** Respond with the finalized checkout state.

---

## Platform Integration

### Prerequisites

Before using this handler, platforms **MUST** complete:

1. Ability to obtain user authorization signatures for supported collectors.
2. RPC access to the chain specified by `chain_id`.

### Payment Protocol

#### Step 1: Discover Handler

Identify `xyz.localprotocol.restaurant.auth_capture` in `payment.handlers`.

#### Step 2: Collect Authorization

Collect a signature or permit using one of the advertised `token_collectors`.

#### Step 3: Authorize Escrow

Submit the authorization onchain to the `escrow_contract`.

#### Step 4: Return Instrument

Write the authorization instrument into `payment.instruments[]` and reference
its `id` in `payment.selected_instrument_id`.

#### Instrument Schema

**Schema URL:** `https://ucp.dev/handlers/localprotocol_auth_capture/instrument.json`

```json
{
  "id": "instr_1",
  "handler_id": "localprotocol_auth_capture",
  "type": "localprotocol_auth_capture",
  "authorization_id": "0xabc123",
  "authorize_tx_hash": "0xdeadbeef",
  "chain_id": 8453,
  "escrow_contract": "0xAuthCaptureEscrow"
}
```
