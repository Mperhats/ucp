## Proposal: Extend Checkout to Support Menu Modifiers

### Summary
Add a vendor capability extension that composes onto the base checkout schema to
support menu items with modifier selections (including nested modifiers). This
keeps the retail `dev.ucp.shopping.checkout` model intact while enabling menu
ordering via the `xyz.localprotocol.commerce` service.

### Goals
- Support menu item purchases with modifier selections in checkout.
- Keep product/variant models unchanged in `shopping`.
- Reuse existing menu modifier selection structure.
- Follow UCP schema authoring and extension composition rules.

### Non-Goals
- Replace or alter `dev.ucp.shopping.checkout`.
- Introduce new checkout operations or transports.
- Force menu item data into shopping catalog/variant models.

---

## Capability and Naming

**Capability name** (reverse-domain format):  
`xyz.localprotocol.commerce.checkout`

**Extends**:  
`dev.ucp.shopping.checkout`

**Schema hosting**:  
`https://localprotocol.xyz/schemas/commerce/checkout.json`

This follows the schema authoring guide:
- Capability schemas are self-describing (`name`, `version`).
- Extensions compose via `allOf`.

---

## Schema Design

### 1) New extension capability schema

Create: `source/schemas/commerce/checkout.json`

Key elements:
- `$id`: `https://localprotocol.xyz/schemas/commerce/checkout.json`
- `name`: `xyz.localprotocol.commerce.checkout`
- `version`: `2026-01-11` (or aligned to your release date)
- `extends`: `dev.ucp.shopping.checkout` (declared in discovery profile)

### 2) Extend Line Item with modifier selections

Define a composed line item type inside the extension schema:

- `$defs/commerce_line_item` = `allOf`:
  - `shopping/types/line_item.json`
  - Adds `modifier_selections`:
    - `type: array`
    - `items: $ref: https://localprotocol.xyz/schemas/menu/types/modifier_selection.json`

### 3) Extend Checkout to use the composed line item

In `$defs/checkout`:
- `allOf` with base `checkout.json`
- Add/override `line_items.items` to reference `$defs/commerce_line_item`

---

## Behavior and Semantics

### Menu item identification
Menu item IDs are carried in `line_items[].item.id`. This reuses the existing
`shopping/types/item.json` shape, where the platform supplies only `id` on
request. Titles/prices remain response-only.

### Modifier selections
Use the existing menu selection shape:
`https://localprotocol.xyz/schemas/menu/types/modifier_selection.json`

This enables:
- Multiple selections per group
- Quantities per modifier option
- Nested selections (`child_selections`)

### Validation rules (business-side)
Businesses validate selections against the menu modifier topology:
- `modifier_group_id` exists on the menu item
- `item_id` exists in the referenced group
- `quantity` respects `max_per_modifier`
- Group cardinality respects `minimum_selections` / `maximum_selections`
- Nested groups only appear when triggered by a selected option

---

## Example

Checkout line item request (partial):

```json
{
  "item": { "id": "donut-dozen" },
  "quantity": 1,
  "modifier_selections": [
    {
      "modifier_group_id": "flavors",
      "selections": [
        { "item_id": "chocolate", "quantity": 2 },
        { "item_id": "strawberry", "quantity": 3 }
      ]
    },
    {
      "modifier_group_id": "glaze",
      "selections": [
        { "item_id": "extra_glaze", "quantity": 1 }
      ]
    }
  ]
}
```

---

## File Additions / Updates

**New**
- `source/schemas/commerce/checkout.json` (extension capability)

**No changes**
- `source/schemas/shopping/checkout.json`
- `source/schemas/shopping/types/line_item.json`
- `source/schemas/menu/types/modifier_selection.json`
- Service OpenAPI/OpenRPC (no new operations)

---

## Discovery Profile

Advertise the extension in `/.well-known/ucp`:

```json
{
  "name": "xyz.localprotocol.commerce.checkout",
  "version": "2026-01-11",
  "spec": "https://localprotocol.xyz/specification/checkout",
  "schema": "https://localprotocol.xyz/schemas/commerce/checkout.json",
  "extends": "dev.ucp.shopping.checkout"
}
```

---

## Spec Generation Checklist

- Add the new schema under `source/schemas/commerce/`.
- Run `python3 generate_schemas.py`.
- Run `python3 validate_specs.py`.

---

## Open Questions

1. Do we want a separate capability name for menu checkout
   (e.g., `xyz.localprotocol.commerce.menu_checkout`)?
2. Should `modifier_selections` be allowed at the line-item level only, or
   also at a higher grouping level for bundled items?
3. Do we need price overrides per modifier option in checkout, or should all
   pricing be resolved from the menu item + modifiers?

