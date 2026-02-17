## V1 Implementation Spec: UCP Checkout (Native REST) + Google Pay (`com.google.pay`) + ERC-8004 Rewards Recipients

### 1) Scope

Implement a **UCP Checkout Capability** server (Business/Merchant) that:

1. exposes the **UCP REST endpoints** for checkout sessions, ([ucp.dev][1])
2. advertises **Google Pay** as a payment handler and accepts a Google Pay payment instrument at completion, ([pay.google.com][2])
3. mints/distributes protocol tokens to **buyer/platform/merchant** after a **successful capture** from a *single* payment adapter (Google Pay token forwarded to your processor), and
4. resolves **merchant + platform payout addresses** via **ERC-8004 `agentWallet`** and gates **buyer payout** via an **EIP-712 signature**. ([best-practices.8004scan.io][3])

**Non-goals (removed for V1):**

* AP2 mandates / merchant-signed checkout
* embedded checkout
* multi-PSP strategies / webhook integrations beyond a single “payment adapter”
* refunds/chargebacks accounting

---

### 2) Components

**Business (UCP Checkout Server)**

* Implements UCP checkout session endpoints (Create/Get/Update/Complete/Cancel). ([ucp.dev][1])
* Stores checkout state server-side.

**Platform/Agent (Client)**

* Calls Business endpoints.
* Uses Google Pay API to collect payment data, maps it to the `com.google.pay` payment instrument schema, then calls Complete. ([pay.google.com][2])

**Payment Adapter (V1 single path)**

* A module inside Business that:

  * accepts the Google Pay token payload (opaque),
  * submits it to your configured processor/gateway,
  * returns a deterministic `PaymentCaptureResult` (success/failure, amount, currency, capture_id).

**Onchain**

* ERC-8004 Identity Registry used for Merchant + Platform identities and payout wallets (`agentWallet`). ([best-practices.8004scan.io][3])
* Rewards contract that mints tokens and splits them among recipients.

---

### 3) Protocol interfaces

#### 3.1 UCP REST endpoints (Business MUST implement)

Per UCP checkout REST binding: ([ucp.dev][1])

* `POST /checkout-sessions` (Create)
* `GET /checkout-sessions/{id}` (Get)
* `PUT /checkout-sessions/{id}` (Update)
* `POST /checkout-sessions/{id}/complete` (Complete)
* `POST /checkout-sessions/{id}/cancel` (Cancel)

Transport requirements (V1):

* HTTPS (min TLS 1.3) ([ucp.dev][1])
* JSON request/response ([ucp.dev][1])

#### 3.2 Checkout lifecycle gates (Business MUST enforce)

Checkout responses include `status` and messages; lifecycle includes (at minimum) `incomplete`, `requires_escalation`, `ready_for_complete`, `complete_in_progress`, `completed`. ([Shopify][4])

**V1 policy**

* Business MUST return `ready_for_complete` only when required fields for payment + order placement are satisfied.
* Business MUST reject `POST /complete` unless status is `ready_for_complete`.
* If Business returns `requires_escalation`, V1 clients SHOULD abort (no embedded flow); `continue_url` exists in spec but is out of scope for V1. ([Shopify][4])

---

### 4) Google Pay handler integration (V1)

#### 4.1 Advertising the handler (Business → Platform)

Business includes `com.google.pay` in `checkout.payment.handlers` with configuration that follows Google Pay request object structure (merchant_info, allowed_payment_methods, tokenization_specification, environment). ([pay.google.com][2])

#### 4.2 Completion payload (Platform → Business)

Platform MUST:

1. run the Google Pay client flow and obtain payment method data,
2. map the result into the `com.google.pay` instrument schema (`card_payment_instrument`) including the `credential` field carrying Google Pay tokenization payload,
3. submit `POST /checkout-sessions/{id}/complete` with that instrument under the checkout’s `payment` section. ([pay.google.com][2])

> V1 treatment: Business treats `credential` as an **opaque token blob** and forwards it to its configured processor/gateway (no direct decryption/verification in this spec).

---

### 5) Rewards extension (V1)

#### 5.1 Checkout extension fields

Business persists these as part of checkout state and echoes them back in checkout responses:

```json
"x_rewards": {
  "merchant_agent_id": "uint256",
  "platform_agent_id": "uint256",
  "buyer_reward_address": "0x…",
  "buyer_reward_sig": "0x…",
  "policy_id": "v1"
}
```

**Meaning**

* `merchant_agent_id`, `platform_agent_id`: ERC-8004 agent IDs whose **onchain `agentWallet`** is the payout wallet. `agentWallet` is reserved and only updatable via `setAgentWallet(...)` with EIP-712 / ERC-1271 verification. ([best-practices.8004scan.io][3])
* `buyer_reward_sig`: EIP-712 signature proving that the buyer authorizes `buyer_reward_address` for rewards for this checkout.

#### 5.2 Buyer EIP-712 signature (V1 typed data)

Buyer signs typed data binding:

* `checkout_id`
* `buyer_reward_address`
* `merchant_agent_id`
* `platform_agent_id`
* `chainId`
* `deadline`

**V1 verification location**

* Rewards contract MUST verify `buyer_reward_sig` onchain (preferred), OR the Business verifies offchain and includes only buyer address onchain (weaker; not recommended).

---

### 6) Payment capture → mint trigger (single-path adapter)

#### 6.1 Complete Checkout processing (Business)

On `POST /checkout-sessions/{id}/complete`:

1. validate status is `ready_for_complete` ([ucp.dev][5])
2. validate `x_rewards.*` is present and syntactically valid
3. validate the request includes a `com.google.pay` payment instrument payload (per handler spec mapping) ([pay.google.com][2])
4. call `PaymentAdapter.capture(googlePayToken, amount, currency, checkout_id)`
5. if capture succeeds:

   * set status to `completed` and return order confirmation
   * call `RewardsSubmitter.mintFromCapture(...)` (synchronously or via durable queue)

#### 6.2 Mint call inputs (Business → Chain)

Business submits a single onchain tx containing:

* `checkout_id` (or hash)
* `merchant_agent_id`, `platform_agent_id`
* `buyer_reward_address`, `buyer_reward_sig`, `deadline`
* `amount`, `currency` (if needed)
* `capture_id` (idempotency key)

Rewards contract behavior:

* resolve `merchant_payout = agentWallet(merchant_agent_id)` and `platform_payout = agentWallet(platform_agent_id)` ([best-practices.8004scan.io][3])
* verify buyer EIP-712 signature
* enforce idempotency (reject reused `capture_id`)
* mint/split tokens per `policy_id=v1`

---

## 7) V1 Test Plan

### 7.1 UCP conformance (REST + lifecycle)

* **Endpoints exist** and match UCP binding + methods. ([ucp.dev][1])
* Create → Update → Get progression; `status` transitions are consistent and `POST /complete` rejects unless `ready_for_complete`. ([ucp.dev][5])
* `requires_escalation` returned by server causes client abort in V1. ([Shopify][4])

### 7.2 Google Pay handler payload acceptance

* Business response advertises `com.google.pay` handler and config shape. ([pay.google.com][2])
* Platform completion request includes a mapped `card_payment_instrument` with `credential` present; Business accepts and forwards to adapter. ([pay.google.com][2])
* Negative: wrong handler_id / missing credential → Complete fails with recoverable error message.

### 7.3 ERC-8004 payout resolution

* Register agent IDs and set `agentWallet`; verify `agentWallet` update rules (reserved key + `setAgentWallet(...)` verification). ([best-practices.8004scan.io][3])
* Mint fails if `agentWallet` is unset/zero for merchant/platform agent IDs.

### 7.4 Buyer signature gating

* Valid EIP-712 signature → mint succeeds.
* Wrong `checkout_id` / wrong address / expired deadline → mint fails.

### 7.5 Mint idempotency + correctness

* Same `capture_id` submitted twice → second tx reverts.
* Mint splits exactly according to `policy_id=v1` (unit test expected balances).

---

If you want, I can also provide the **exact V1 JSON shapes** for:

* `POST /checkout-sessions` request/response (including the `payment.handlers` declaration), and
* `POST /checkout-sessions/{id}/complete` request with `com.google.pay` instrument + `x_rewards`, aligned to the handler spec’s fields. ([pay.google.com][2])

[1]: https://ucp.dev/specification/checkout-rest/ "HTTP/REST Binding - Universal Commerce Protocol (UCP)"
[2]: https://pay.google.com/gp/p/ucp/2026-01-11/ "pay.google.com"
[3]: https://best-practices.8004scan.io/docs/01-agent-metadata-standard.html "Agent Metadata Profile (AgentURI) | ERC-8004"
[4]: https://shopify.dev/docs/agents/checkout?utm_source=chatgpt.com "Checkout for agents"
[5]: https://ucp.dev/specification/checkout/?utm_source=chatgpt.com "Overview - Universal Commerce Protocol (UCP)"
