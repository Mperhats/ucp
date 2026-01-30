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

# Delivery in Restaurant Checkout

**Version:** `2026-01-11`

## Overview

Restaurant checkout models fulfillment as **pickup** or **on-demand delivery**.
Unlike the core shopping fulfillment extension (shipping + pickup with package
groups and shipping options), the restaurant model is purpose-built for
time-sensitive fulfillment and integrates with the delivery domain’s quoting
and lifecycle events.

At a high level:

* `fulfillment` is a first-class field on restaurant `checkout` (not a separate
  extension capability)
* `methods[]` contains exactly one selected fulfillment method (`pickup` or `on_demand_delivery`)
* `destinations[]` are pickup locations (retail locations only)
* `delivery` (on-demand delivery only) embeds delivery inputs, including the
  dropoff address
* `available_methods[]` provide method-level availability hints

## Restaurant-Specific Modeling Principles

Restaurant fulfillment favors **time-critical** and **location-specific**
delivery over shipping-style options. As a result:

* **No group/package abstraction**: there is no per-package option selection.
* **Method-level selection**: a single method is selected, with pickup destination
  (for pickup) or delivery quote/inputs (for delivery) rather than group option.
* **Embedded delivery inputs**: delivery quoting inputs live on the method, so
  checkout can be completed without a separate fulfillment extension flow.
* **Order lifecycle events**: fulfillment status is driven by pickup or delivery
  events recorded on the order (not by checkout status alone).

## Differences from Core Shopping Fulfillment

| Area | Shopping (Core UCP) | Restaurant (Delivery Domain) |
| --- | --- | --- |
| Method types | `shipping`, `pickup` | `pickup`, `on_demand_delivery` |
| Item assignment | `line_item_ids` required per method | No `line_item_ids` on methods (method applies to entire order) |
| Options & groups | `groups[].options[]` with `selected_option_id` | **Not modeled** (no groups or options) |
| Destination shape | Shipping address or retail location | Pickup uses `retail_location`; delivery dropoff comes from `delivery.dropoff` |
| Availability | `available_methods[]` includes `line_item_ids` | Method-level availability only |
| Delivery integration | None | `delivery` includes delivery inputs |
| Extension config | `supports_multi_group`, multi-destination rules | Not applicable |
| Checkout placement | Fulfillment is an extension | Fulfillment is embedded in restaurant checkout |
| Line item model | Product catalog items | Menu items with modifier selections |
| Order lifecycle | Not fulfillment-event driven | Fulfillment status derives from pickup/delivery events |

## Schema

### Properties

{{ schema_fields('types/fulfillment_resp', 'restaurant/checkout') }}

### Entities

#### Fulfillment

{{ schema_fields('types/fulfillment_resp', 'restaurant/checkout') }}

#### Fulfillment Method

{{ schema_fields('types/fulfillment_method_resp', 'restaurant/checkout') }}

#### Fulfillment Availability

{{ schema_fields('types/fulfillment_available_method_resp', 'restaurant/checkout') }}

#### Fulfillment Destination

Fulfillment destinations are pickup-only and reuse shopping location models:

* `retail_location` for pickup

For on-demand delivery, the dropoff address is provided via `delivery.dropoff`.

#### Delivery Inputs

On-demand delivery requires `delivery_inputs` (pickup + dropoff + timing + items
value).

See:

* `spec/source/schemas/delivery/types/delivery_inputs.json`

## Fulfillment Method Semantics

Restaurant fulfillment methods are modeled as a **type-specific union**. The
schema enforces method-specific destinations and requires `delivery` when the
selected method is `on_demand_delivery`.

### Pickup

* `type: pickup`
* `destinations[]` are `retail_location` entries
* `delivery` **must not** be provided

### On-Demand Delivery

* `type: on_demand_delivery`
* `delivery` **is required** and MUST be `delivery_inputs`
* `destinations[]` **must not** be provided
* Dropoff address is provided via `delivery.dropoff` when using `delivery_inputs`

## Platform and Business Responsibilities

**Platform**

* Render method selection as a pickup vs delivery choice.
* For pickup, render destination selection from `destinations[]`.
* For delivery, collect dropoff details for the `delivery` object.
* Use `available_methods[]` descriptions to set buyer expectations for timing.

**Business**

* Provide at least one method unless checkout is `requires_escalation`.
* When returning `on_demand_delivery`, include `delivery` with either a fresh
  quote or full delivery inputs.
* Ensure `selected_destination_id` matches an entry in `destinations[]` for
  pickup methods only.

## Checkout and Order Lifecycle Impact

Restaurant checkout keeps the same status lifecycle as core shopping checkout,
but fulfillment completion is tied to pickup readiness or delivery quotes:

* `ready_for_complete` should only be returned after a valid pickup destination
  or delivery quote/inputs is provided.
* On `complete_checkout`, the business returns `order` and subsequent updates
  are delivered asynchronously via order lifecycle events.

### Lifecycle Differences vs Shopping

* Shopping allows option selection per group; restaurant fulfillment must be
  fully specified before `ready_for_complete`.
* On-demand delivery introduces external quote expiry, which can force
  `requires_escalation` if refreshed input is needed.

### Completion Handling

* `complete_checkout` **SHOULD** be idempotent to prevent duplicate deliveries
  when retries occur.
* When delivery creation is in progress after completion, the business may
  return `complete_in_progress` and finalize asynchronously with a subsequent
  `completed` checkout state and `order.delivery` populated.

### Restaurant Lifecycle Alignment (Status-Level)

This model intentionally keeps the **status lifecycle** aligned with shopping
checkout while applying restaurant-specific readiness rules:

* `incomplete` — Method, destination, or delivery quote/inputs are missing.
* `ready_for_complete` — Buyer has selected a method and destination; for
  `on_demand_delivery`, a valid `delivery` quote or inputs are present.
* `requires_escalation` — The platform cannot proceed (e.g., delivery quote
  expired, unsupported delivery handoff, or address requires merchant UI).
* `complete_in_progress` — Business is creating the order after
  `complete_checkout`.
* `completed` — Order is accepted and `order` is returned; fulfillment progresses
  asynchronously in the delivery pipeline.

Restaurant order fulfillment status is derived from the **latest fulfillment
event** and uses the event types defined by the selected method:

* Pickup events: `ready`, `arrived`, `completed`, `canceled`
* Delivery events: `pending`, `pickup`, `pickup_complete`, `dropoff`,
  `delivered`, `canceled`, `returned`, `ongoing`

### Order Event Delivery

Order lifecycle events are delivered out-of-band. Platforms provide a
`webhook_url` in their order capability config so merchants can push pickup or
delivery events as the order progresses.

## Availability Guidance

`available_methods[]` provide **method-level** availability (not per-item). Use
clear, time-oriented messaging that can be shown directly to buyers.

### Recommended Patterns

* `fulfillable_on: "now"` for immediate availability
* RFC 3339 timestamp when the method becomes available later

### Example Messages

* Pickup now: "Ready for pickup in 20 minutes"
* Pickup later: "Pickup available today after 6:00pm"
* Delivery now: "Delivery available in 35-45 minutes"
* Delivery later: "Delivery available after 7:30pm"

### Availability Example

```json
{
  "fulfillment": {
    "available_methods": [
      {
        "type": "pickup",
        "fulfillable_on": "now",
        "description": "Ready for pickup in 20 minutes"
      },
      {
        "type": "pickup",
        "fulfillable_on": "2026-01-30T18:00:00Z",
        "description": "Pickup available today after 6:00pm"
      },
      {
        "type": "on_demand_delivery",
        "fulfillable_on": "now",
        "description": "Delivery available in 35-45 minutes"
      },
      {
        "type": "on_demand_delivery",
        "fulfillable_on": "2026-01-30T19:30:00Z",
        "description": "Delivery available after 7:30pm"
      }
    ]
  }
}
```

## Example (Delivery Inputs)

This example shows a single selected method. The delivery method includes a required
`delivery` object using delivery inputs.

```json
{
  "fulfillment": {
    "methods": [
      {
        "id": "delivery",
        "type": "on_demand_delivery",
        "delivery": {
          "pickup": {
            "id": "store_1",
            "name": "Downtown Store",
            "address": {
              "street_address": "123 Main St",
              "address_locality": "Springfield",
              "address_region": "IL",
              "postal_code": "62701",
              "address_country": "US"
            }
          },
          "dropoff": {
            "id": "dropoff_1",
            "full_name": "Alex Smith",
            "phone_number": "+1-555-0100",
            "street_address": "456 Oak Ave",
            "address_locality": "Springfield",
            "address_region": "IL",
            "postal_code": "62701",
            "address_country": "US"
          },
          "items_value": {
            "amount": 4599,
            "currency": "USD"
          }
        }
      }
    ],
    "available_methods": [
      {
        "type": "pickup",
        "fulfillable_on": "now",
        "description": "Ready for pickup in 20 minutes"
      },
      {
        "type": "on_demand_delivery",
        "fulfillable_on": "2026-01-30T18:10:00Z",
        "description": "Delivery available in 35-45 minutes"
      }
    ]
  }
}
```

### Example (Delivery-Only Selection)

This example shows a delivery-only selection using delivery inputs and no pickup
method present.

```json
{
  "fulfillment": {
    "methods": [
      {
        "id": "delivery",
        "type": "on_demand_delivery",
        "delivery": {
          "pickup": {
            "id": "store_1",
            "name": "Downtown Store",
            "address": {
              "street_address": "123 Main St",
              "address_locality": "Springfield",
              "address_region": "IL",
              "postal_code": "62701",
              "address_country": "US"
            }
          },
          "dropoff": {
            "id": "dropoff_1",
            "full_name": "Alex Smith",
            "phone_number": "+1-555-0100",
            "street_address": "456 Oak Ave",
            "address_locality": "Springfield",
            "address_region": "IL",
            "postal_code": "62701",
            "address_country": "US"
          },
          "items_value": {
            "amount": 4599,
            "currency": "USD"
          }
        }
      }
    ]
  }
}
```

### Example with Full Delivery Inputs

This example shows an on-demand delivery method where the required
`delivery` object is provided inline using full delivery inputs.

```json
{
  "fulfillment": {
    "methods": [
      {
        "id": "delivery",
        "type": "on_demand_delivery",
        "delivery": {
          "pickup": {
            "id": "store_1",
            "name": "Downtown Store",
            "address": {
              "street_address": "123 Main St",
              "address_locality": "Springfield",
              "address_region": "IL",
              "postal_code": "62701",
              "address_country": "US"
            }
          },
          "dropoff": {
            "id": "dropoff_1",
            "full_name": "Alex Smith",
            "phone_number": "+1-555-0100",
            "street_address": "456 Oak Ave",
            "address_locality": "Springfield",
            "address_region": "IL",
            "postal_code": "62701",
            "address_country": "US"
          },
          "pickup_ready_dt": "2026-01-30T18:05:00Z",
          "dropoff_deadline_dt": "2026-01-30T19:00:00Z",
          "items_value": {
            "amount": 4599,
            "currency": "USD"
          },
          "external_store_id": "store_1"
        }
      }
    ]
  }
}
```
