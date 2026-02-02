```text
response_schema: application/json

root
├── media (object, required)
│   └── [media_id] (object)
│       ├── type (string, required)
│       │   └── Media type discriminator. One of: "image", "video", "model_3d"
│       ├── url (string, required)
│       │   └── URL to the media resource
│       ├── alt_text (string, optional)
│       │   └── Accessibility text describing the media
│       ├── width (integer >= 1, optional)
│       │   └── Width in pixels (for images/video)
│       └── height (integer >= 1, optional)
│           └── Height in pixels (for images/video)
│
├── categories (object, required)
│   └── [category_id] (object)
│       ├── id (string, required)
│       │   └── The identifier in the third-party system (uuidV4 generated for new)
│       ├── name (string, required)
│       │   └── Name of category
│       ├── description (string, optional)
│       │   └── Description of category
│       ├── item_ids (array of string, optional, default: [])
│       │   └── All items in the category
│       ├── media_ids (array of string, optional, default: [])
│       │   └── Media references for category
│
├── modifier_groups (object, required)
│   └── [modifier_group_id] (object)
│       ├── id (string, required)
│       │   └── Identifier (uuidV4 for new)
│       ├── name (string, required)
│       │   └── Name of modifier group
│       ├── minimum_selections (integer >= 0, optional)
│       │   └── Min selections in this group (0 = no min)
│       ├── maximum_selections (integer >= 0, optional)
│       │   └── Max selections in this group (0 = no max)
│       ├── max_per_modifier_selection_quantity (integer >= 0, optional, default: 1)
│       │   └── Max selectable per modifier (0 = unlimited; default: 1)
│       ├── item_ids (array of string, optional, default: [])
│       │   └── Identifiers for items within this group
│       ├── description (string, optional)
│       │   └── Description for modifier group
│
├── menus (object, required)
│   └── [menu_id] (object)
│       ├── id (string, required)
│       │   └── Internal identifier
│       ├── name (string, required)
│       │   └── Name of menu
│       ├── category_ids (array of string, optional, default: [])
│       │   └── Categories in this menu
│       ├── fulfillment_modes (array of string, optional, default: [])
│       │   └── Allowed: "DELIVERY", "PICK_UP"
│       ├── description (string, optional)
│       │   └── Description of the menu
│       ├── hours (object: hours, optional)
│       │   └── List of hour_intervals
│
├── items (object, required)
│   └── [item_id] (object)
│       ├── id (string, required, non-empty)
│       │   └── Internal identifier of item
│       ├── name (string, required)
│       │   └── Item name
│       ├── price (object: money, required)
│       │   └── Price amount
│       ├── metadata (object, optional)
│       │   └── Business-defined metadata (modifier or menu item)
│       ├── media_ids (array of string, optional)
│       │   └── Media references for menu items
│       ├── description (string, optional)
│       │   └── Item description (menu items)
│       ├── modifier_group_ids (array of string, optional, default: [])
│       │   └── Modifier groups for this menu item
│
│   Note: The items map includes both menu items and modifier items.
│   Modifier items typically include only id, name, price, and optional metadata.
│   Menu items include media_ids, description, and modifier_group_ids.
│
├── checkout_notes (informative)
│   └── Line items reference menu items via item snapshots and use modifier_selections
│       to capture nested modifier choices during checkout.
│       - modifier_group_id points to the group in modifier_groups
│       - item_id points to the selected modifier item in items
│       - parent_selection_id / parent_selection_path link nested selections
│         back to the selection that introduced a child modifier group
```
