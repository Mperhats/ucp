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

# Restaurant Catalog Plan

This document captures a minimal, UCP-aligned plan for representing restaurant
catalog data using the existing `shopping` catalog capability.

## Goals

- Represent restaurant menus with categories, items, modifiers, and photos.
- Keep catalog and checkout compatible (`variant.id` → `line_items[].item.id`).
- Avoid introducing a new domain; extend the existing `shopping/catalog` types.

## Strategy

- Use **Product** as the menu item container.
- Use **Variant** as the buyable unit (even if there is only one).
- Keep menu items as Products with a single Variant (if needed).
- Put restaurant-specific fields into `product.metadata` and/or
  `variant.metadata` for minimal schema changes.

## Mapping: Example → Shopping Types

### Photos
- **Example:** `photos` keyed map
- **UCP types:** `types/media.json` on `Product` or `Variant`
- **Plan:** map to `product.media[]` and/or `variant.media[]` with `type: "image"`.

### Menus / Categories
- **Example:** `menus`, `categories`, `categoryIds`
- **UCP types:** no dedicated menu/category entities
- **Plan:** store in `product.metadata`:
  - `metadata.menu_id`
  - `metadata.category_ids`

### Items
- **Example:** `items` with name, description, status, price, photos, modifiers
- **UCP types:** `Product` + single `Variant`
- **Plan:**
  - `item.name` → `product.title`
  - `item.description` → `product.description.plain`
  - `item.price` → `variant.price`
  - `item.status.saleStatus` → `variant.availability.available`
  - `item.photoIds` → `product.media` / `variant.media`

### Price Overrides / Charges / Tax / SKU Details
- **Example:** `priceOverrides`, `additionalCharges`, `tax`, `skuDetails`
- **UCP types:** not modeled in catalog types
- **Plan:** store under `product.metadata` or `variant.metadata`, e.g.:
  - `metadata.price_overrides`
  - `metadata.additional_charges`
  - `metadata.tax`
  - `metadata.sku_details`
  - `metadata.fulfillment_modes`

## Gaps / Optional Extensions

If stronger typing is needed later, add minimal new types:

- `types/menu_section.json`
- `types/additional_charge.json`
- `types/tax.json`
- `types/sku_details.json`
- `types/fulfillment_modes.json`

## Proposed Next Steps

1. Add a **Restaurant Mapping** subsection to `docs/specification/catalog.md`.
2. Document the metadata conventions above.
3. Add a small modifier-heavy example in `catalog-rest.md` / `catalog-mcp.md`.
4. Keep checkout mapping unchanged (variant ID used as `line_items[].item.id`).
