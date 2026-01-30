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

# Menu Capability

* **Capability Name:** `xyz.localprotocol.restaurant.menu`
* **Version:** `DRAFT`

## Overview

Allows platforms to fetch normalized restaurant menus and configurable items.
Menu data is returned as ID-keyed maps (media, categories, menus, items, modifier
groups) so clients can resolve relationships without nested payloads.

**Key Concepts**

* **Menu**: A collection of categories and fulfillment modes.
* **Category**: A grouping of items for display.
* **Menu Item**: A base menu item with price, media, and modifier groups.
* **Modifier Group**: A set of selectable modifier items with selection rules.
* **Modifier Item**: The purchasable add-on with its own pricing and metadata.
* **Modifier Selection**: The buyer's chosen modifiers and quantities.

## Normalized Menu Response

Menu responses include the following normalized maps:

* `media`: Media assets keyed by media ID.
* `categories`: Categories keyed by category ID.
* `menus`: Menus keyed by menu ID.
* `items`: Items keyed by item ID (includes menu items and modifier items).
* `modifier_groups`: Modifier groups keyed by modifier group ID.

### Example Response (Normalized)

```json
{
  "ucp": {
    "version": "2026-01-11",
    "capabilities": [
      {
        "name": "xyz.localprotocol.restaurant.menu",
        "version": "2026-01-11"
      }
    ]
  },
  "media": {
    "media_sdasd": {
      "type": "image",
      "url": "https://cdn.example.com/menu/donut-dozen.webp",
      "alt_text": "Assorted dozen donuts",
      "width": 1200,
      "height": 800
    }
  },
  "categories": {
    "cat_savvas": {
      "id": "cat_savvas",
      "name": "Breakfast",
      "description": "Morning favorites",
      "item_ids": ["item_sdasd"],
      "media_ids": ["media_sdasd"]
    }
  },
  "menus": {
    "menu_asdv": {
      "id": "menu_asdv",
      "name": "All Day Menu",
      "category_ids": ["cat_savvas"],
      "fulfillment_modes": ["DELIVERY", "PICK_UP"],
      "description": "Available all day"
    }
  },
  "items": {
    "item_sdasd": {
      "id": "item_sdasd",
      "name": "Donut Dozen",
      "description": { "plain": "Choose up to 12 donuts." },
      "price": { "amount": 1299, "currency": "USD" },
      "media_ids": ["media_sdasd"],
      "modifier_group_ids": ["group_asdvasvd"],
      "metadata": {
        "nutrition": {
          "per_serving": {
            "calories": 240,
            "macros": { "carbs_g": 32, "fat_g": 11, "protein_g": 3 }
          }
        }
      }
    },
    "mod_asdfvasv": {
      "id": "mod_asdfvasv",
      "name": "Chocolate",
      "price": { "amount": 0, "currency": "USD" },
      "metadata": { "tags": ["glaze", "chocolate"] }
    },
    "mod_sdvfwer": {
      "id": "mod_sdvfwer",
      "name": "Strawberry",
      "price": { "amount": 0, "currency": "USD" }
    },
    "mod_glzlight": {
      "id": "mod_glzlight",
      "name": "Light Glaze",
      "price": { "amount": 0, "currency": "USD" }
    },
    "mod_glzextra": {
      "id": "mod_glzextra",
      "name": "Extra Glaze",
      "price": { "amount": 50, "currency": "USD" }
    }
  },
  "modifier_groups": {
    "group_asdvasvd": {
      "id": "group_asdvasvd",
      "name": "Choose up to 12 flavors",
      "minimum_selections": 0,
      "maximum_selections": 12,
      "max_per_modifier_selection_quantity": 6,
      "item_ids": ["mod_asdfvasv", "mod_sdvfwer"],
      "description": "Pick your donut flavors"
    },
    "group_glaze": {
      "id": "group_glaze",
      "name": "Glaze",
      "minimum_selections": 1,
      "maximum_selections": 1,
      "item_ids": ["mod_glzlight", "mod_glzextra"],
      "description": "Choose a glaze for chocolate donuts"
    }
  }
}
```

## Modifier Selection Flow

A buyer selects one or more modifier items to form a selection list attached to the base item.
Nested modifier groups are represented by linking selections with
`parent_selection_id` and/or `parent_selection_path`.

**Example (donut box with nested glaze choice)**

```json
{
  "item": {
    "id": "item_sdasd",
    "modifier_group_ids": ["group_asdvasvd"]
  },
  "modifier_selections": [
    { "id": "mod_asdfvasv", "modifier_group_id": "group_asdvasvd", "item_id": "mod_asdfvasv", "quantity": 2 },
    {
      "id": "mod_glzextra",
      "modifier_group_id": "group_glaze",
      "item_id": "mod_glzextra",
      "quantity": 1,
      "parent_selection_id": "mod_asdfvasv",
      "parent_selection_path": ["mod_asdfvasv"]
    },
    { "id": "mod_sdvfwer", "modifier_group_id": "group_asdvasvd", "item_id": "mod_sdvfwer", "quantity": 3 }
  ]
}
```

In this model:
- **Modifier item** is the purchasable add-on (e.g., `chocolate`).
- **Modifier selection** captures what the buyer chose and quantities.
- **Selection `id`** is required for linking nested selections via `parent_selection_id`.
- **Nested groups** are linked via `parent_selection_id` or `parent_selection_path`
  to the modifier selection that introduced the child group.

## Operations

The Menu capability defines a single logical operation.

| Operation | Description |
| :--- | :--- |
| **Get Menus** | Retrieve normalized menus, categories, items, modifier groups, and media. |

### Get Menus

Retrieves normalized menu data (menus, categories, items, modifier groups, media).

{{ method_fields('get_menus', 'restaurant/rest.openapi.json', 'restaurant/menu') }}

## Entities

### Context

Location and market context for menu operations. All fields are optional.
Platforms MAY geo-detect context from request IP/headers. When context fields
are provided, they MUST override any auto-detected values.

{{ extension_schema_fields('restaurant/menu.json#/$defs/context', 'restaurant/menu') }}

### Menu

{{ schema_fields('restaurant/types/menu', 'restaurant/menu') }}

### Category

{{ schema_fields('restaurant/types/category', 'restaurant/menu') }}

### Menu Item

{{ schema_fields('restaurant/types/menu_item', 'restaurant/menu') }}

### Modifier Group

{{ schema_fields('restaurant/types/modifier_group', 'restaurant/menu') }}

### Modifier Item

{{ schema_fields('restaurant/types/modifier_item', 'restaurant/menu') }}


### Modifier Selection

{{ schema_fields('restaurant/types/modifier_selection', 'restaurant/menu') }}
