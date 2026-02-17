Here’s what I found + a “minimal edits” proposal that keeps the spirit of PR #55 (generic, composable, extension-friendly) while supporting **restaurant-style nested modifier groups**.

---

## 1) What PR #55 adds to UCP: a first-class Catalog capability

PR **#55** introduces a new capability called **`dev.ucp.shopping.catalog`** for **product discovery** (search + lookup), specifically to fill the gap where Checkout assumes the platform already knows the “item/variant id” to buy. ([GitHub][1])

Key parts of PR #55 (from the PR description):

* A **Product** (catalog entry) with fields like id/title/description/url/category, price range, media, options, variants, rating, metadata ([GitHub][1])
* A **Variant** (purchasable SKU) whose **`id` is used as `item.id` in checkout** ([GitHub][1])
* Two operations:

  * `search_catalog` (free-text + filters + pagination + “intent” hinting)
  * `get_catalog_item` (lookup by product id or variant id; returns parent product + variants context) ([GitHub][1])

So: PR #55’s “catalog” is retail-oriented (**Product/Variant**), but it’s the right place to hang **menu item customization metadata** (modifiers) as an optional/extension layer.

---

## 2) Best-practice mental model for modifiers (Shopify + restaurant POS world)

### A. Restaurant POS “nested modifiers” pattern (Toast et al.)

In restaurant systems, “nested modifiers” usually means:

> Selecting a modifier can *require* a follow-up choice (a child modifier group). ([Toast Central][2])

Example: *Choose “Milk” → if “Oat milk” selected → choose “Sweetener” group.*

That dependency is the key thing your schema must express:
**(parent group) + (selected option) ⇒ (child group(s))**

### B. Shopify’s practical modeling patterns (what exists today)

Shopify doesn’t have a native “restaurant modifier tree” primitive in its core product model (and Shopify POS users ask for modifiers explicitly). ([Shopify Community][3])

What Shopify *does* provide that maps well:

1. **Variants / options** for “real SKUs” (inventory/price identity).
2. **Line item properties** to attach per-line customization name/value pairs. ([Shopify][4])
3. **Nested cart lines** to model add-ons as parent→child cart line relationships. ([Shopify][5])

For restaurant delivery, most ecosystems end up with:

* base item = a SKU/variant
* modifiers = either:

  * “virtual” customizations (captured as line item properties), or
  * add-on SKUs attached to the base line (nested cart lines / add-on lines)

Your example JSON is *already* aligned with common POS abstractions:

* **`modifierGroups`** with min/max/defaults
* group contains **`itemIds`** (modifier options)
* base **`items`** attach **`modifierGroupIds`**
* you want to add **nesting** on top

---

## 3) Option C: New “Menu” capability (no variants)

The cleanest “UCP-native” way is to **model restaurant-style modifiers in a separate domain** instead of forcing them into Product/Variant. This keeps retail catalog semantics intact and gives modifiers a first-class home without the variant mismatch.

### 3.1 New capability: `dev.ucp.menu`

#### A) Menu side: advertise modifier topology

**Define a Menu Item** that owns modifier topology directly:

* `modifier_groups?: { [id]: MenuModifierGroup }`
* `modifier_items?: { [id]: MenuModifierItem }`

##### Key minimal addition for nesting

Add **one optional field** that expresses the dependency edge:

**Option 1 (most minimal): add to ModifierGroup**
Inside each group, instead of `itemIds: string[]`, allow richer entries:

```json
"modifier_options": [
  {
    "item_id": "6d53cf04-...",
    "child_modifier_group_ids": ["mg_child_1", "mg_child_2"]
  }
]
```

That’s literally the nesting rule.

*(You can keep `itemIds` for backward compatibility and allow either form.)*

#### B) Order side: represent selected modifiers as a tree

Define a reusable selection object to capture the chosen modifier tree (to be used by any menu ordering flow):

* `modifier_selections?: MenuModifierSelection[]`

Where:

```ts
interface MenuModifierSelection {
  modifier_group_id: string
  selections: Array<{
    item_id: string
    quantity?: number
    // recursive: only needed when nested groups exist
    child_selections?: MenuModifierSelection[]
  }>
}
```

This is the minimal structure that:

* supports min/max enforcement per group
* supports nested follow-ups
* stays close to how restaurant ordering UIs actually render decisions

### 3.2 Why this is minimal and clearer

* **No variant conflation**: Menu items are not forced into SKU/option logic.
* **Cleaner semantics**: Modifiers live with the menu item that owns them.
* **Shopping stays retail-friendly**: Product/Variant remain unchanged.

### 3.3 Concrete schema edits (diff-style description)

**Add new capability + types (new domain):**

* `source/schemas/menu/menu.json` (capability wrapper + search request/response)
* `source/schemas/menu/types/item.json`
* `source/schemas/menu/types/modifier_group.json`
* `source/schemas/menu/types/modifier_option.json`
* `source/schemas/menu/types/modifier_item.json`
* `source/schemas/menu/types/modifier_selection.json`
* `source/schemas/menu/types/merchant_search_filters.json` (moved from shopping)
* `source/schemas/menu/types/distance.json` (moved from shopping)

**Spec update checklist (per CONTRIBUTING):**

* Run `python generate_schemas.py` to update `spec/`
* Run `python validate_specs.py` to validate JSON/YAML and references
* Regenerate SDK models that depend on schemas (e.g., `bash sdk/python/generate_models.sh`)

No changes required to PR #55’s core `Product` / `Variant` meaning.

---

## 4) Mapping your JSON to the menu model

Your current objects map cleanly to the new menu schema:

* `items[...]` → `modifier_items`
* `modifierGroups[...]` → `modifier_groups`

Example `item` (abridged):

```json
{
  "id": "fa4f0192-...",
  "title": "Lemonade",
  "price": { "amount": 450, "currency": "USD" },
  "modifier_items": {
    "6d53cf04-...": { "id": "6d53cf04-...", "title": "Add Straw", "price": { "amount": 0, "currency": "USD" } },
    "red_straw": { "id": "red_straw", "title": "Red Straw", "price": { "amount": 0, "currency": "USD" } },
    "blue_straw": { "id": "blue_straw", "title": "Blue Straw", "price": { "amount": 0, "currency": "USD" } }
  },
  "modifier_groups": {
    "f4c69056-...": {
      "id": "f4c69056-...",
      "name": "Add Straw",
      "minimum_selections": 0,
      "maximum_selections": 1,
      "modifier_options": [
        {
          "item_id": "6d53cf04-...",
          "selection_quantity_default": 1,
          "child_modifier_group_ids": ["mg_choose_color"]
        }
      ]
    },
    "mg_choose_color": {
      "id": "mg_choose_color",
      "name": "Straw Color",
      "minimum_selections": 1,
      "maximum_selections": 1,
      "modifier_options": [
        { "item_id": "red_straw" },
        { "item_id": "blue_straw" }
      ]
    }
  }
}
```

A menu ordering payload would then capture selections using the menu modifier selection type:

```json
{
  "item_id": "fa4f0192-...",
  "quantity": 1,
  "modifier_selections": [
    {
      "modifier_group_id": "f4c69056-...",
      "selections": [
        {
          "item_id": "6d53cf04-...",
          "quantity": 1,
          "child_selections": [
            {
              "modifier_group_id": "mg_choose_color",
              "selections": [{ "item_id": "red_straw", "quantity": 1 }]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 5) Two optional “nice” additions (still minimal, but useful)

1. **Price deltas on modifier options**
   Restaurants often price modifiers independent of being full items. If you want *minimal*, keep “modifier is an item”; otherwise add:

* `modifier_option.price_override?: Price` (or `price_delta?: number` in minor units)

2. **Hide/show + requirement logic**
   Sometimes a child group is required only when a modifier is chosen. Your `child_modifier_group_ids` already implies that. If you need “required-when-triggered”, add:

* `child_modifier_group_rules: [{ group_id, required: true }]`

---

If you want, I can turn the above into a tight PR-ready checklist of *exact* file additions matching UCP’s schema authoring conventions (names/versions/ids) on `ucp.dev`. ([Universal Commerce Protocol][8])

[1]: https://github.com/Universal-Commerce-Protocol/ucp/pull/55 "feat(catalog): Catalog capability for product discovery by igrigorik · Pull Request #55 · Universal-Commerce-Protocol/ucp · GitHub"
[2]: https://central.toasttab.com/s/article/Building-Nested-Modifiers?utm_source=chatgpt.com "Build Nested Modifiers (Add Modifiers to a Modifier)"
[3]: https://community.shopify.com/t/how-can-i-add-modifiers-to-pos-systems-for-better-cafe-usage/209346?utm_source=chatgpt.com "How can I add 'Modifiers' to POS systems for better cafe ..."
[4]: https://shopify.dev/docs/api/liquid/objects/line_item?utm_source=chatgpt.com "Liquid objects: line_item"
[5]: https://shopify.dev/docs/apps/build/product-merchandising/nested-cart-lines?utm_source=chatgpt.com "Nested cart lines"
[6]: https://shopify.engineering/ucp?utm_source=chatgpt.com "Building the Universal Commerce Protocol (2026)"
[7]: https://developers.google.com/merchant/ucp/guides/checkout/embedded?utm_source=chatgpt.com "Embedded checkout"
[8]: https://ucp.dev/documentation/schema-authoring/?utm_source=chatgpt.com "Schema Authoring - Universal Commerce Protocol (UCP)"
