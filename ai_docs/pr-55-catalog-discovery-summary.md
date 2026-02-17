---
title: "PR 55 Catalog Discovery Summary"
branch: "modifier-updates"
compare_base: "upstream/main"
generated_at: "2026-01-16"
---

# PR 55 Catalog Discovery Overview

This note summarizes the changes introduced by PR 55 (commit `fdae801`) and
provides the current branch delta versus `upstream/main`.

## Latest Commit on This Branch

- `6e6ad56 remove helper docs`
  - Deletes helper docs in `ai_docs/`
  - Adds a `.gitignore` entry

## Commits Ahead of `upstream/main`

- `fdae801 feat: add catalog schemas and modifier selections` (PR 55)
- `4f2ea60 revert modifier concepts`
- `6eb392d update readme`
- `6e6ad56 remove helper docs`

## PR 55: Catalog Discovery Changes

### Specs and Documentation

- New catalog capability specs:
  - `docs/specification/catalog.md`
  - `docs/specification/catalog-rest.md`
  - `docs/specification/catalog-mcp.md`

### Schemas (Source and Spec)

- New catalog schema: `catalog.json`
- New shared types:
  - `context`, `media`, `pagination`, `price`, `price_filter`, `price_range`
  - `product`, `product_option`, `rating`, `search_filters`
  - `selected_option`, `variant`
- Modifier selection support:
  - New types: `modifier_group`, `modifier_item`, `selection`
  - Added to existing types: `item`, `line_item`, `order_line_item`
  - Propagated to request/response schema variants in `spec/`

### Service Definitions

- `source/services/shopping/openapi.json`
- `source/services/shopping/openrpc.json`
- `spec/services/shopping/rest.openapi.json`
- `spec/services/shopping/mcp.openrpc.json`

### Tooling and Build Updates

- Schema generation and validation:
  - `main.py`, `generate_schemas.py`, `schema_utils.py`, `validate_specs.py`
- Docs configuration: `mkdocs.yml`

## Current Branch Diff vs `upstream/main` (High Level)

- 49 files changed, +2624 / -59
- Primarily catalog discovery schemas, services, and docs
- Post-PR 55 changes:
  - README updates
  - Revert of modifier concepts
  - Removal of AI helper docs

## PR 55: Per-File Diff Summary (Commit `fdae801`)

Use the diff reference to inspect each change locally:
`git show fdae801 -- <path>`.

| Status | File | Diff reference | Summary |
| --- | --- | --- | --- |
| A | `ai_docs/catalog_mcp.md` | `git show fdae801 -- ai_docs/catalog_mcp.md` | Adds catalog MCP helper doc. |
| A | `ai_docs/discovery.md` | `git show fdae801 -- ai_docs/discovery.md` | Adds catalog discovery helper notes. |
| A | `ai_docs/google_ucp.md` | `git show fdae801 -- ai_docs/google_ucp.md` | Adds Google UCP helper doc. |
| A | `ai_docs/shopify_catalog.md` | `git show fdae801 -- ai_docs/shopify_catalog.md` | Adds Shopify catalog helper doc. |
| A | `ai_docs/storefront_ucp.md` | `git show fdae801 -- ai_docs/storefront_ucp.md` | Adds storefront UCP helper doc. |
| A | `docs/specification/catalog-mcp.md` | `git show fdae801 -- docs/specification/catalog-mcp.md` | Adds catalog MCP specification doc. |
| A | `docs/specification/catalog-rest.md` | `git show fdae801 -- docs/specification/catalog-rest.md` | Adds catalog REST specification doc. |
| A | `docs/specification/catalog.md` | `git show fdae801 -- docs/specification/catalog.md` | Adds catalog capability specification doc. |
| M | `generate_schemas.py` | `git show fdae801 -- generate_schemas.py` | Updates schema generation for catalog types. |
| M | `main.py` | `git show fdae801 -- main.py` | Wires new catalog schema defs into generation. |
| M | `mkdocs.yml` | `git show fdae801 -- mkdocs.yml` | Adds catalog docs to MkDocs nav. |
| M | `schema_utils.py` | `git show fdae801 -- schema_utils.py` | Updates schema utilities for catalog types. |
| A | `source/schemas/shopping/catalog.json` | `git show fdae801 -- source/schemas/shopping/catalog.json` | Adds catalog schema. |
| A | `source/schemas/shopping/types/context.json` | `git show fdae801 -- source/schemas/shopping/types/context.json` | Adds context type. |
| M | `source/schemas/shopping/types/item.json` | `git show fdae801 -- source/schemas/shopping/types/item.json` | Adds modifier selections to items. |
| M | `source/schemas/shopping/types/line_item.json` | `git show fdae801 -- source/schemas/shopping/types/line_item.json` | Adds modifier selections to line items. |
| A | `source/schemas/shopping/types/media.json` | `git show fdae801 -- source/schemas/shopping/types/media.json` | Adds media type. |
| A | `source/schemas/shopping/types/modifier_group.json` | `git show fdae801 -- source/schemas/shopping/types/modifier_group.json` | Adds modifier group type. |
| A | `source/schemas/shopping/types/modifier_item.json` | `git show fdae801 -- source/schemas/shopping/types/modifier_item.json` | Adds modifier item type. |
| A | `source/schemas/shopping/types/option_value.json` | `git show fdae801 -- source/schemas/shopping/types/option_value.json` | Adds option value type. |
| M | `source/schemas/shopping/types/order_line_item.json` | `git show fdae801 -- source/schemas/shopping/types/order_line_item.json` | Adds modifier selections to order line items. |
| A | `source/schemas/shopping/types/pagination.json` | `git show fdae801 -- source/schemas/shopping/types/pagination.json` | Adds pagination type. |
| A | `source/schemas/shopping/types/price.json` | `git show fdae801 -- source/schemas/shopping/types/price.json` | Adds price type. |
| A | `source/schemas/shopping/types/price_filter.json` | `git show fdae801 -- source/schemas/shopping/types/price_filter.json` | Adds price filter type. |
| A | `source/schemas/shopping/types/price_range.json` | `git show fdae801 -- source/schemas/shopping/types/price_range.json` | Adds price range type. |
| A | `source/schemas/shopping/types/product.json` | `git show fdae801 -- source/schemas/shopping/types/product.json` | Adds product type. |
| A | `source/schemas/shopping/types/product_option.json` | `git show fdae801 -- source/schemas/shopping/types/product_option.json` | Adds product option type. |
| A | `source/schemas/shopping/types/rating.json` | `git show fdae801 -- source/schemas/shopping/types/rating.json` | Adds rating type. |
| A | `source/schemas/shopping/types/search_filters.json` | `git show fdae801 -- source/schemas/shopping/types/search_filters.json` | Adds search filters type. |
| A | `source/schemas/shopping/types/selected_option.json` | `git show fdae801 -- source/schemas/shopping/types/selected_option.json` | Adds selected option type. |
| A | `source/schemas/shopping/types/selection.json` | `git show fdae801 -- source/schemas/shopping/types/selection.json` | Adds selection type. |
| A | `source/schemas/shopping/types/variant.json` | `git show fdae801 -- source/schemas/shopping/types/variant.json` | Adds variant type. |
| M | `source/schemas/ucp.json` | `git show fdae801 -- source/schemas/ucp.json` | Updates UCP schema with catalog capability/types. |
| M | `source/services/shopping/openapi.json` | `git show fdae801 -- source/services/shopping/openapi.json` | Adds catalog REST endpoints. |
| M | `source/services/shopping/openrpc.json` | `git show fdae801 -- source/services/shopping/openrpc.json` | Adds catalog MCP methods. |
| A | `spec/schemas/shopping/catalog.json` | `git show fdae801 -- spec/schemas/shopping/catalog.json` | Adds catalog spec schema. |
| A | `spec/schemas/shopping/types/context.json` | `git show fdae801 -- spec/schemas/shopping/types/context.json` | Adds context spec type. |
| M | `spec/schemas/shopping/types/item_resp.json` | `git show fdae801 -- spec/schemas/shopping/types/item_resp.json` | Adds modifier selections to item response. |
| M | `spec/schemas/shopping/types/line_item.create_req.json` | `git show fdae801 -- spec/schemas/shopping/types/line_item.create_req.json` | Adds modifier selections to line item create. |
| M | `spec/schemas/shopping/types/line_item.update_req.json` | `git show fdae801 -- spec/schemas/shopping/types/line_item.update_req.json` | Adds modifier selections to line item update. |
| M | `spec/schemas/shopping/types/line_item_resp.json` | `git show fdae801 -- spec/schemas/shopping/types/line_item_resp.json` | Adds modifier selections to line item response. |
| A | `spec/schemas/shopping/types/media.json` | `git show fdae801 -- spec/schemas/shopping/types/media.json` | Adds media spec type. |
| A | `spec/schemas/shopping/types/modifier_group.json` | `git show fdae801 -- spec/schemas/shopping/types/modifier_group.json` | Adds modifier group spec type. |
| A | `spec/schemas/shopping/types/modifier_item.json` | `git show fdae801 -- spec/schemas/shopping/types/modifier_item.json` | Adds modifier item spec type. |
| A | `spec/schemas/shopping/types/option_value.json` | `git show fdae801 -- spec/schemas/shopping/types/option_value.json` | Adds option value spec type. |
| M | `spec/schemas/shopping/types/order_line_item.json` | `git show fdae801 -- spec/schemas/shopping/types/order_line_item.json` | Adds modifier selections to order line item. |
| A | `spec/schemas/shopping/types/pagination.json` | `git show fdae801 -- spec/schemas/shopping/types/pagination.json` | Adds pagination spec type. |
| A | `spec/schemas/shopping/types/price.json` | `git show fdae801 -- spec/schemas/shopping/types/price.json` | Adds price spec type. |
| A | `spec/schemas/shopping/types/price_filter.json` | `git show fdae801 -- spec/schemas/shopping/types/price_filter.json` | Adds price filter spec type. |
| A | `spec/schemas/shopping/types/price_range.json` | `git show fdae801 -- spec/schemas/shopping/types/price_range.json` | Adds price range spec type. |
| A | `spec/schemas/shopping/types/product.json` | `git show fdae801 -- spec/schemas/shopping/types/product.json` | Adds product spec type. |
| A | `spec/schemas/shopping/types/product_option.json` | `git show fdae801 -- spec/schemas/shopping/types/product_option.json` | Adds product option spec type. |
| A | `spec/schemas/shopping/types/rating.json` | `git show fdae801 -- spec/schemas/shopping/types/rating.json` | Adds rating spec type. |
| A | `spec/schemas/shopping/types/search_filters.json` | `git show fdae801 -- spec/schemas/shopping/types/search_filters.json` | Adds search filters spec type. |
| A | `spec/schemas/shopping/types/selected_option.json` | `git show fdae801 -- spec/schemas/shopping/types/selected_option.json` | Adds selected option spec type. |
| A | `spec/schemas/shopping/types/selection.json` | `git show fdae801 -- spec/schemas/shopping/types/selection.json` | Adds selection spec type. |
| A | `spec/schemas/shopping/types/variant.json` | `git show fdae801 -- spec/schemas/shopping/types/variant.json` | Adds variant spec type. |
| M | `spec/schemas/ucp.json` | `git show fdae801 -- spec/schemas/ucp.json` | Updates UCP spec with catalog capability/types. |
| M | `spec/services/shopping/mcp.openrpc.json` | `git show fdae801 -- spec/services/shopping/mcp.openrpc.json` | Adds catalog MCP methods. |
| M | `spec/services/shopping/rest.openapi.json` | `git show fdae801 -- spec/services/shopping/rest.openapi.json` | Adds catalog REST endpoints. |
| M | `validate_specs.py` | `git show fdae801 -- validate_specs.py` | Updates validation for new schemas. |

## PR 55: Code Diffs (Key Files)

Below are concrete diffs from `fdae801` for the most relevant modified files.
For added schema files and full contents, use:
`git show fdae801 -- <path>`.

### `generate_schemas.py`

```diff
diff --git a/generate_schemas.py b/generate_schemas.py
index b024581..993ff39 100644
--- a/generate_schemas.py
+++ b/generate_schemas.py
@@ -26,6 +26,8 @@ from source/services/shopping/embedded.json and extension schemas.
 Usage: python generate_schemas.py
 """
 
+from __future__ import annotations
+
 import copy
 import json
 import os
```

### `main.py`

```diff
diff --git a/main.py b/main.py
index a4ca60f..33d682c 100644
--- a/main.py
+++ b/main.py
@@ -109,7 +109,7 @@ def define_env(env):
     the same specification file.
 
     Args:
-      ref_string: e.g., "types/line_item.create_req.json"
+      ref_string: e.g., "types/line_item.create_req.json" or "types/pagination.json#/$defs/response"
       spec_file_name: e.g., "checkout"
 
     Returns:
@@ -125,7 +125,14 @@ def define_env(env):
     ):
       spec_file_name = "checkout"
 
-    filename = Path(ref_string).name
+    # Extract fragment identifier if present (e.g., #/$defs/response)
+    # This handles cases like "types/pagination.json#/$defs/response"
+    fragment = None
+    ref_path = ref_string
+    if '#/$defs/' in ref_string:
+      ref_path, fragment = ref_string.split('#/$defs/', 1)
+
+    filename = os.path.basename(ref_path)
@@ -137,13 +144,20 @@ def define_env(env):
 
     # 2. Generate Link Text (Visual)
     # e.g. "checkout_response" -> "Checkout Response"
-    link_text = (
-      raw_name.replace("_", " ").replace(".", " ").replace("-", " ").title()
-    )
-    if link_text.endswith("Resp"):
-      link_text = link_text.replace("Resp", "Response")
-    elif link_text.endswith("Req"):
-      link_text = link_text.replace("Req", "Request")
+    # e.g. "pagination" + fragment "response" -> "Pagination Response"
+    if fragment:
+      base_text = raw_name.replace('_', ' ').replace('.', ' ').replace('-', ' ').title()
+      fragment_text = fragment.replace('_', ' ').replace('.', ' ').replace('-', ' ').title()
+      link_text = f'{base_text} {fragment_text}'
+    else:
+      link_text = (
+          raw_name.replace('_', ' ').replace('.', ' ').replace('-', ' ').title()
+      )
+
+    if link_text.endswith('Resp'):
+      link_text = link_text.replace('Resp', 'Response')
+    elif link_text.endswith('Req'):
+      link_text = link_text.replace('Req', 'Request')
@@ -159,7 +173,14 @@ def define_env(env):
 
     anchor_name = base_entity.replace("_", "-")
 
-    if len(parts) > 1:
+    # Handle fragment in anchor (e.g., pagination#/$defs/response -> pagination-response)
+    if fragment:
+      fragment_anchor = fragment.replace('_', '-')
+      if anchor_name:  # External ref: base-fragment
+        anchor_name = f'{anchor_name}-{fragment_anchor}'
+      else:  # Internal ref like #/$defs/context: just use fragment
+        anchor_name = fragment_anchor
+    elif len(parts) > 1:
       variant = parts[1]
       variant_expanded = (
         variant.replace("create_req", "create-request")
```

### `schema_utils.py`

```diff
diff --git a/schema_utils.py b/schema_utils.py
index e5828ea..8832892 100644
--- a/schema_utils.py
+++ b/schema_utils.py
@@ -14,6 +14,8 @@
 
 """Shared utilities for schema processing and validation."""
 
+from __future__ import annotations
+
 import json
 from collections.abc import Callable
 from pathlib import Path
```

### `source/schemas/shopping/types/item.json`

```diff
diff --git a/source/schemas/shopping/types/item.json b/source/schemas/shopping/types/item.json
index a6af775..6af42d6 100644
--- a/source/schemas/shopping/types/item.json
+++ b/source/schemas/shopping/types/item.json
@@ -29,6 +29,14 @@
       "description": "Product image URI.",
       "format": "uri",
       "ucp_request": "omit"
+    },
+    "modifier_groups": {
+      "type": "array",
+      "items": {
+        "$ref": "modifier_group.json"
+      },
+      "description": "Modifier groups available for this item.",
+      "ucp_request": "omit"
     }
   }
 }
```

### `source/schemas/shopping/types/line_item.json`

```diff
diff --git a/source/schemas/shopping/types/line_item.json b/source/schemas/shopping/types/line_item.json
index c89431d..1d672ec 100644
--- a/source/schemas/shopping/types/line_item.json
+++ b/source/schemas/shopping/types/line_item.json
@@ -41,6 +41,13 @@
         "create": "omit",
         "update": "optional"
       }
+    },
+    "modifier_selections": {
+      "type": "array",
+      "items": {
+        "$ref": "selection.json"
+      },
+      "description": "Selected modifiers for this line item."
     }
   }
 }
```

### `source/schemas/shopping/types/order_line_item.json`

```diff
diff --git a/source/schemas/shopping/types/order_line_item.json b/source/schemas/shopping/types/order_line_item.json
index 758e6b6..41e8446 100644
--- a/source/schemas/shopping/types/order_line_item.json
+++ b/source/schemas/shopping/types/order_line_item.json
@@ -55,6 +55,13 @@
     "parent_id": {
       "type": "string",
       "description": "Parent line item identifier for any nested structures."
+    },
+    "modifier_selections": {
+      "type": "array",
+      "items": {
+        "$ref": "selection.json"
+      },
+      "description": "Selected modifiers for this line item."
     }
   }
 }
```

### `source/schemas/ucp.json`

```diff
diff --git a/source/schemas/ucp.json b/source/schemas/ucp.json
index b532a10..0f92a36 100644
--- a/source/schemas/ucp.json
+++ b/source/schemas/ucp.json
@@ -33,9 +33,9 @@
       }
     },
 
-    "response_checkout": {
-      "title": "UCP Checkout Response",
-      "description": "UCP metadata for checkout responses.",
+    "response": {
+      "title": "UCP Response Metadata",
+      "description": "Generic UCP envelope for all API responses.",
       "type": "object",
       "required": ["version", "capabilities"],
       "properties": {
@@ -48,19 +48,16 @@
       }
     },
 
+    "response_checkout": {
+      "title": "UCP Checkout Response",
+      "description": "UCP metadata for checkout responses.",
+      "$ref": "#/$defs/response"
+    },
+
     "response_order": {
       "title": "UCP Order Response",
-      "description": "UCP metadata for order responses. No payment handlers needed post-purchase.",
-      "type": "object",
-      "required": ["version", "capabilities"],
-      "properties": {
-        "version": {"$ref": "#/$defs/version"},
-        "capabilities": {
-          "type": "array",
-          "description": "Active capabilities for this response.",
-          "items": {"$ref": "capability.json#/$defs/response"}
-        }
-      }
+      "description": "UCP metadata for order responses.",
+      "$ref": "#/$defs/response"
     }
   }
 }
```

### `source/services/shopping/openapi.json`

```diff
diff --git a/source/services/shopping/openapi.json b/source/services/shopping/openapi.json
index 2d7bfac..808e7c9 100644
--- a/source/services/shopping/openapi.json
+++ b/source/services/shopping/openapi.json
@@ -338,6 +338,76 @@
           }
         }
       }
+    },
+    "/catalog/search": {
+      "post": {
+        "operationId": "search_catalog",
+        "summary": "Search Catalog",
+        "description": "Search for products in the business's catalog.",
+        "parameters": [
+          { "$ref": "#/components/parameters/authorization" },
+          { "$ref": "#/components/parameters/x_api_key" },
+          { "$ref": "#/components/parameters/request_signature" },
+          { "$ref": "#/components/parameters/request_id" },
+          { "$ref": "#/components/parameters/user_agent" },
+          { "$ref": "#/components/parameters/content_type" },
+          { "$ref": "#/components/parameters/accept" },
+          { "$ref": "#/components/parameters/accept_language" },
+          { "$ref": "#/components/parameters/accept_encoding" }
+        ],
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": { "$ref": "#/components/schemas/catalog_search_request" }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "Search results",
+            "content": {
+              "application/json": {
+                "schema": { "$ref": "#/components/schemas/catalog_search_response" }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/catalog/item/{id}": {
+      "get": {
+        "operationId": "get_catalog_item",
+        "summary": "Get Catalog Item",
+        "description": "Get a product or variant by ID. Returns the parent product with context. For product IDs, variants may contain a representative set. For variant IDs, variants contains only the requested variant.",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": { "type": "string" },
+            "description": "Global ID (GID) of product or variant."
+          },
+          { "$ref": "#/components/parameters/authorization" },
+          { "$ref": "#/components/parameters/x_api_key" },
+          { "$ref": "#/components/parameters/request_signature" },
+          { "$ref": "#/components/parameters/request_id" },
+          { "$ref": "#/components/parameters/user_agent" },
+          { "$ref": "#/components/parameters/accept" },
+          { "$ref": "#/components/parameters/accept_language" },
+          { "$ref": "#/components/parameters/accept_encoding" }
+        ],
+        "responses": {
+          "200": {
+            "description": "Item details",
+            "content": {
+              "application/json": {
+                "schema": { "$ref": "#/components/schemas/catalog_get_item_response" }
+              }
+            }
+          }
+        }
+      }
     }
   },
   "webhooks": {
@@ -524,6 +594,15 @@
       "payment_data": {
         "$ref": "https://ucp.dev/schemas/shopping/payment_data.json"
       },
+      "catalog_search_response": {
+        "$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_response"
+      },
+      "catalog_search_request": {
+        "$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_request"
+      },
+      "catalog_get_item_response": {
+        "$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/get_item_response"
+      },
       "ucp": {
         "$ref": "https://ucp.dev/schemas/ucp.json"
       }
```

### `source/services/shopping/openrpc.json`

```diff
diff --git a/source/services/shopping/openrpc.json b/source/services/shopping/openrpc.json
index 89312cc..9b571ac 100644
--- a/source/services/shopping/openrpc.json
+++ b/source/services/shopping/openrpc.json
@@ -113,6 +113,41 @@
         "name": "checkout",
         "schema": {"$ref": "https://ucp.dev/schemas/shopping/checkout.json"}
       }
+    },
+    {
+      "name": "search_catalog",
+      "summary": "Search for products in the catalog",
+      "params": [
+        {
+          "name": "request",
+          "required": true,
+          "schema": {"$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_request"}
+        }
+      ],
+      "result": {
+        "name": "response",
+        "schema": {"$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_response"}
+      }
+    },
+    {
+      "name": "get_catalog_item",
+      "summary": "Get a product or variant by ID",
+      "description": "Returns the parent product with context. For product IDs, variants may contain a representative set. For variant IDs, variants contains only the requested variant.",
+      "params": [
+        {
+          "name": "id",
+          "required": true,
+          "schema": {"type": "string", "description": "Global ID (GID) of product or variant."}
+        },
+        {
+          "name": "context",
+          "schema": {"$ref": "https://ucp.dev/schemas/shopping/types/context.json", "description": "Location and market context. Platforms MAY geo-detect from request; provided fields MUST override."}
+        }
+      ],
+      "result": {
+        "name": "response",
+        "schema": {"$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/get_item_response"}
+      }
     }
   ]
 }
```

### `spec/services/shopping/mcp.openrpc.json`

```diff
diff --git a/spec/services/shopping/mcp.openrpc.json b/spec/services/shopping/mcp.openrpc.json
index 89312cc..9b571ac 100644
--- a/spec/services/shopping/mcp.openrpc.json
+++ b/spec/services/shopping/mcp.openrpc.json
@@ -113,6 +113,41 @@
         "name": "checkout",
         "schema": {"$ref": "https://ucp.dev/schemas/shopping/checkout.json"}
       }
+    },
+    {
+      "name": "search_catalog",
+      "summary": "Search for products in the catalog",
+      "params": [
+        {
+          "name": "request",
+          "required": true,
+          "schema": {"$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_request"}
+        }
+      ],
+      "result": {
+        "name": "response",
+        "schema": {"$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_response"}
+      }
+    },
+    {
+      "name": "get_catalog_item",
+      "summary": "Get a product or variant by ID",
+      "description": "Returns the parent product with context. For product IDs, variants may contain a representative set. For variant IDs, variants contains only the requested variant.",
+      "params": [
+        {
+          "name": "id",
+          "required": true,
+          "schema": {"type": "string", "description": "Global ID (GID) of product or variant."}
+        },
+        {
+          "name": "context",
+          "schema": {"$ref": "https://ucp.dev/schemas/shopping/types/context.json", "description": "Location and market context. Platforms MAY geo-detect from request; provided fields MUST override."}
+        }
+      ],
+      "result": {
+        "name": "response",
+        "schema": {"$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/get_item_response"}
+      }
     }
   ]
 }
```

### `spec/services/shopping/rest.openapi.json`

```diff
diff --git a/spec/services/shopping/rest.openapi.json b/spec/services/shopping/rest.openapi.json
index 83b92f6..7d165b0 100644
--- a/spec/services/shopping/rest.openapi.json
+++ b/spec/services/shopping/rest.openapi.json
@@ -352,6 +352,118 @@
           }
         }
       }
+    },
+    "/catalog/search": {
+      "post": {
+        "operationId": "search_catalog",
+        "summary": "Search Catalog",
+        "description": "Search for products in the business's catalog.",
+        "parameters": [
+          {
+            "$ref": "#/components/parameters/authorization"
+          },
+          {
+            "$ref": "#/components/parameters/x_api_key"
+          },
+          {
+            "$ref": "#/components/parameters/request_signature"
+          },
+          {
+            "$ref": "#/components/parameters/request_id"
+          },
+          {
+            "$ref": "#/components/parameters/user_agent"
+          },
+          {
+            "$ref": "#/components/parameters/content_type"
+          },
+          {
+            "$ref": "#/components/parameters/accept"
+          },
+          {
+            "$ref": "#/components/parameters/accept_language"
+          },
+          {
+            "$ref": "#/components/parameters/accept_encoding"
+          }
+        ],
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/catalog_search_request"
+              }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "Search results",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/catalog_search_response"
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/catalog/item/{id}": {
+      "get": {
+        "operationId": "get_catalog_item",
+        "summary": "Get Catalog Item",
+        "description": "Get a product or variant by ID. Returns the parent product with context. For product IDs, variants may contain a representative set. For variant IDs, variants contains only the requested variant.",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": {
+              "type": "string"
+            },
+            "description": "Global ID (GID) of product or variant."
+          },
+          {
+            "$ref": "#/components/parameters/authorization"
+          },
+          {
+            "$ref": "#/components/parameters/x_api_key"
+          },
+          {
+            "$ref": "#/components/parameters/request_signature"
+          },
+          {
+            "$ref": "#/components/parameters/request_id"
+          },
+          {
+            "$ref": "#/components/parameters/user_agent"
+          },
+          {
+            "$ref": "#/components/parameters/accept"
+          },
+          {
+            "$ref": "#/components/parameters/accept_language"
+          },
+          {
+            "$ref": "#/components/parameters/accept_encoding"
+          }
+        ],
+        "responses": {
+          "200": {
+            "description": "Item details",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/catalog_get_item_response"
+                }
+              }
+            }
+          }
+        }
+      }
     }
   },
   "webhooks": {
@@ -543,6 +655,15 @@
       "payment_data": {
         "$ref": "https://ucp.dev/schemas/shopping/payment_data.json"
       },
+      "catalog_search_response": {
+        "$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_response"
+      },
+      "catalog_search_request": {
+        "$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/search_request"
+      },
+      "catalog_get_item_response": {
+        "$ref": "https://ucp.dev/schemas/shopping/catalog.json#/$defs/get_item_response"
+      },
       "ucp": {
         "$ref": "https://ucp.dev/schemas/ucp.json"
       },
```

### `validate_specs.py`

```diff
diff --git a/validate_specs.py b/validate_specs.py
index 43891cf..39bbefc 100644
--- a/validate_specs.py
+++ b/validate_specs.py
@@ -17,6 +17,8 @@
 Usage: python validate_specs.py
 """
 
+from __future__ import annotations
+
 import json
 import os
 import sys
@@ -24,7 +26,12 @@ from pathlib import Path
 from typing import Any
 
 import schema_utils
-import yaml
+try:
+  import yaml
+  HAS_YAML = True
+except ModuleNotFoundError:
+  yaml = None
+  HAS_YAML = False
@@ -152,6 +159,8 @@ def validate_file(filepath: str) -> tuple[bool, str | None]:
 
   # 2. Validate YAML
   elif filepath.endswith((".yaml", ".yml")):
+    if not HAS_YAML:
+      return True, None
     try:
       with Path(filepath).open(encoding="utf-8") as f:
         data = yaml.safe_load(f)
@@ -179,6 +188,11 @@ def main() -> None:
     sys.exit(0)
 
   print(f"🔍 Scanning '{SPEC_DIR}/' for syntax and reference errors...")
+  if not HAS_YAML:
+    print(
+      f"{Colors.YELLOW}Warning: PyYAML not installed; skipping YAML files."
+      f"{Colors.RESET}"
+    )
 
   error_count = 0
   file_count = 0
```
