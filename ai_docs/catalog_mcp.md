---
title: Catalog MCP
description: Search and discover products across Shopify with MCP tools.
---

On this page

* [How it works](#how-it-works)
* [Authenticate](#authenticate)
* [JSON-RPC endpoint](#json-rpc-endpoint)
* [Available tools](#available-tools)
* [Workflow example](#workflow-example)
* [Best practices](#best-practices)

# Catalog MCP

The Catalog MCP server lets your AI agent help buyers discover products across Shopify:

* Search globally for products across all Shopify merchants.
* Retrieve detailed product information, including variants, pricing, and availability.
* Filter results by price, location, product options, and buyer preferences.

For usage guidelines, see [About Shopify Catalog](./shopify_catalog.md). For the UCP protocol overview, see Core concepts.

***

## How it works

Catalog MCP exposes JSON-RPC tools over HTTPS. You authenticate with a JWT, then call tools for search and lookup.

***

## Authenticate

Obtain your client credentials (client ID and secret) from the Catalog section of Dev Dashboard. Use them to fetch a JWT access token. All requests require the `Authorization: Bearer {token}` header.

```bash
curl --request POST \
  --url https://api.shopify.com/auth/access_token \
  --header 'Content-Type: application/json' \
  --data '{
    "client_id": "{your_client_id}",
    "client_secret": "{your_client_secret}",
    "grant_type": "client_credentials"
  }'
```

The response includes:

* `access_token`: JWT access token to call the MCP server.
* `scope`: Granted access scopes.
* `expires_in`: Seconds until the token expires.

JWT tokens created from Dev Dashboard credentials have a 60-minute TTL. You can use `jwt.io` to inspect token details.

```json
{
  "access_token": "f8563253df0bf277ec9ac6f649fc3f17",
  "scope": "read_global_api_catalog_search",
  "expires_in": 86399
}
```

***

## JSON-RPC endpoint

All requests follow the JSON-RPC 2.0 protocol. Send `POST` requests to:

`https://discover.shopifyapps.com/global/mcp`

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "tool_name",
    "arguments": {
      "key": "value"
    }
  }
}
```

***

## Available tools

Catalog MCP provides core tools for product discovery across all of Shopify:

* `search_global_products`: Search for products across all Shopify merchants based on buyer queries and preferences.
* `get_global_product_details`: Retrieve detailed information about a specific product using its Universal Product ID (UPID) or a variant ID.

### search_global_products

Search for products across the global Shopify catalog based on buyer queries and preferences. Use this when buyers are searching for products without specifying a particular shop.

The `search_global_products` tool wraps the Catalog API Search endpoint, which you can also use directly depending on your use case.

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `context` | string | Yes | Additional info like demographics, mood, or location to tailor results. |
| `query` | string | Yes | Search query (for example, "shoes", "blue jeans"). |
| `available_for_sale` | boolean | No | When true, include only items for sale. |
| `include_secondhand` | boolean | No | When true, include secondhand products. |
| `limit` | integer | No | Max number of products to return (1-300). Default: 10. |
| `max_price` | number | No | Maximum price without currency unit. |
| `min_price` | number | No | Minimum price without currency unit. |
| `products_limit` | integer | No | Max products per universal product (1-10). Default: 10. |
| `requires_selling_plan` | boolean | No | When true, include only subscription products. |
| `saved_catalog` | string | No | Saved catalog slug; saved filters take precedence. |
| `ships_from` | string | No | Filter by shipping origin (ISO country code). |
| `ships_to` | string | No | Filter by shipping destination (ISO country code). |
| `shop_ids` | array | No | Array of shop IDs to filter by. |

**Example**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "I need a crewneck sweater",
      "context": "buyer looking for sustainable fashion",
      "limit": 3
    }
  }
}
```

**Response**

```json
{
  "offers": [
    {
      "id": "gid://shopify/p/abc123def456",
      "title": "Organic Cotton Crewneck Sweater",
      "description": "A sustainably made crewneck sweater crafted from 100% organic cotton with a relaxed fit.",
      "images": [
        {
          "url": "https://cdn.shopify.com/s/files/example/organic-cotton-crewneck.jpg",
          "altText": "Organic Cotton Crewneck Sweater - EcoWear",
          "product": {
            "id": "gid://shopify/Product/1234567890",
            "title": "Organic Cotton Crewneck Sweater",
            "onlineStoreUrl": "https://ecowear-example.myshopify.com/products/organic-cotton-crewneck?variant=11111111111&_gsid=example123",
            "shop": {
              "name": "EcoWear",
              "onlineStoreUrl": "https://ecowear-example.myshopify.com"
            }
          }
        }
      ],
      "options": [
        {
          "name": "Size",
          "values": [
            { "value": "S", "availableForSale": true, "exists": true },
            { "value": "M", "availableForSale": true, "exists": true },
            { "value": "L", "availableForSale": true, "exists": true }
          ]
        },
        {
          "name": "Color",
          "values": [
            { "value": "Oatmeal", "availableForSale": true, "exists": true },
            { "value": "Forest Green", "availableForSale": true, "exists": true }
          ]
        }
      ]
    }
  ]
}
```

**Examples**

Use price and shipping filters:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "wireless headphones",
      "context": "buyer prefers noise-cancelling features, budget-conscious",
      "min_price": 50,
      "max_price": 200,
      "ships_to": "US",
      "available_for_sale": true,
      "limit": 15
    }
  }
}
```

Subscription products:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "coffee beans",
      "context": "buyer interested in monthly coffee subscription",
      "requires_selling_plan": true,
      "ships_to": "CA",
      "limit": 5
    }
  }
}
```

Secondhand products:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "vintage leather jacket",
      "context": "buyer looking for sustainable fashion options",
      "include_secondhand": true,
      "max_price": 150,
      "limit": 20
    }
  }
}
```

### get_global_product_details

Retrieve detailed information about a specific product using its UPID or a variant ID.

**Identifier requirement**

Provide exactly one of `upid` or `variant_id`. Providing both returns an error.

Use this tool when a buyer is asking about a specific product and you have either the product ID or a variant ID. This tool returns comprehensive product information including all variants, detailed pricing, availability, and shop details.

The `get_global_product_details` tool wraps the Catalog API Lookup and Lookup by variant endpoints.

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `upid` | string | Yes* | Universal Product ID (Base62). Required if `variant_id` is not provided. |
| `variant_id` | integer | Yes* | Shopify variant ID. Required if `upid` is not provided. |
| `_gsid` | string | No | Reference to the Global Search that generated the URL. |
| `available_for_sale` | boolean | No | When true, include only products for sale. |
| `context` | string | No | Additional info about the request. |
| `include_secondhand` | boolean | No | Include secondhand products in results. |
| `limit` | integer | No | Maximum offers to return (1-100). Default: 10. |
| `max_price` | number | No | Maximum price the buyer is willing to pay. |
| `min_price` | number | No | Minimum price the buyer is willing to pay. |
| `option_preferences` | string | No | Comma-separated option names ranked by importance. |
| `product_id` | integer | No | Pin this product to the top of results. |
| `product_options` | array | No | Filter by product options (key + values). |
| `query` | string | No | Additional keyword search within the product. |
| `ships_from` | string | No | Filter by shipping origin (ISO country code). |
| `ships_to` | string | No | Filter by shipping destination (ISO country code). |
| `shop_id` | string | No | Filter by specific shop (numeric ID or Shop GID). |

**Example**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ"
    }
  }
}
```

**Response**

```json
{
  "product": {
    "id": "gid://shopify/p/xyz789abc123",
    "title": "Organic Cotton Crewneck Sweater",
    "description": "A soft crewneck sweater crafted from 100% organic cotton with a relaxed fit for everyday comfort.",
    "images": [
      {
        "url": "https://cdn.shopify.com/s/files/example/organic-cotton-crewneck-front.jpg",
        "altText": "Organic Cotton Crewneck Sweater - Front"
      }
    ],
    "options": [
      {
        "name": "Size",
        "values": [
          { "value": "S", "availableForSale": true, "exists": true },
          { "value": "M", "availableForSale": true, "exists": true },
          { "value": "L", "availableForSale": true, "exists": true }
        ]
      }
    ]
  }
}
```

**Examples**

Lookup by variant ID:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "variant_id": 43696935272470,
      "context": "buyer wants details on this specific variant"
    }
  }
}
```

Filter by product options:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "product_options": [
        { "key": "Color", "values": ["Blue", "Navy"] },
        { "key": "Size", "values": ["Medium", "Large"] }
      ],
      "context": "buyer prefers darker colors and medium fit"
    }
  }
}
```

Price range and shipping:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "min_price": 20,
      "max_price": 100,
      "ships_to": "GB",
      "available_for_sale": true,
      "limit": 20
    }
  }
}
```

Option preferences for flexible matching:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "product_options": [
        { "key": "Color", "values": ["Red"] },
        { "key": "Size", "values": ["Small"] }
      ],
      "option_preferences": "Color,Size",
      "context": "buyer strongly prefers red color, size is flexible"
    }
  }
}
```

Pin a specific shop and variant:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "shop_id": "gid://shopify/Shop/68817551382",
      "variant_id": 43696935272470,
      "include_secondhand": false
    }
  }
}
```

***

## Workflow example

A typical workflow combines both tools: search first, then look up details.

**Step 1: Search for products**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "glossier lip balm",
      "context": "buyer prefers light and bright colors",
      "ships_to": "US",
      "limit": 5
    }
  }
}
```

**Step 2: Get details for a specific product**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 2,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "product_options": [
        { "key": "Color", "values": ["Cherry", "Pink"] }
      ],
      "context": "buyer looking for subtle pink tones"
    }
  }
}
```

***

## Best practices

* Context is key: Always provide detailed buyer context for better results.
* Price ranges: Use `min_price` and `max_price` to keep results within budget.
* Shipping: Include `ships_to` for accurate regional pricing and availability.
* Product options: Use `option_preferences` when you need flexible matching.
* Availability: Set `available_for_sale` to true to avoid out-of-stock items.
* Limits: Start with reasonable limits (10-20) and increase only if needed.
* Error handling: Check response status and provide helpful feedback to buyers.
How it works
The Catalog MCP server lets your AI agent help buyers discover products:

Search globally for products across all Shopify merchants based on buyer preferences and criteria.
Get detailed information about specific products including variants, pricing, and availability.
Filter results by price, location, product options, and other buyer preferences.
For usage guidelines, see About Catalog. For the UCP protocol overview, see Core 
concepts
.

Authenticate
Obtain your client credentials (client ID and secret) from the Catalog section of Dev Dashboard.

Then use those credentials to retrieve a token for subsequent requests. All requests require the Authorization: Bearer {token} header.

POST
https://api.shopify.com/auth/access_token
Copy
1
2
3
4
5
6
7
8
curl --request POST \
  --url https://api.shopify.com/auth/access_token \
  --header 'Content-Type: application/json' \
  --data '{
    "client_id": "{your_client_id}",
    "client_secret": "{your_client_secret}",
    "grant_type": "client_credentials"
  }'
The response will contain:

access_token: A JWT access token that can be used to interact with the MCP server.
scope: The list of access scopes that were granted to your API key.
expires_in: The number of seconds until the access token expires.
JWT tokens created from Dev Dashboard credentials have a 60-minute TTL. You can use a JWT decoder tool like jwt.io
 to investigate more details related to how Shopify issues this token.

{} Response
Copy
1
2
3
4
5
{
    "access_token": "f8563253df0bf277ec9ac6f649fc3f17",
    "scope": "read_global_api_catalog_search",
    "expires_in": 86399
}
All requests follow the JSON-RPC 2.0 protocol. Send 
POST
 requests to:
Copy
1
https://discover.shopifyapps.com/global/mcp
Learn more about building agentic commerce experiences.

POST
https://discover.shopifyapps.com/global/mcp
Copy
1
2
3
4
5
6
7
8
9
10
11
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "tool_name",
    "arguments": {
      // tool-specific arguments
    }
  }
}
Available tools
Catalog MCP provides core tools for product discovery across all of Shopify:

search_global_products: Search for products across all Shopify merchants based on buyer queries and preferences.
get_global_product_details: Retrieve detailed information about a specific product using its Universal Product ID (UPID) or a variant ID.
search_global_products
Search for products across the global Shopify catalog based on buyer queries and preferences.

Use this tool when buyers are searching for products without specifying a particular shop. The tool searches across all Shopify merchants and returns relevant products based on the query, price range, shipping preferences, and other criteria.

When to use:

"I'm looking for a pair of shoes"
"Could you find me some blue jeans?"
"I need a new dress, I'm a size 10 and I like the color blue"
Catalog API
The search_global_products tool wraps the Search endpoint of Catalog API, which can also be used depending on your use case.

Parameters
context
•
string
Required
Additional information about the request such as user demographics, mood, location, or other relevant details that could help tailor the response.

query
•
string
Required
The search query to find related products. For example, "shoes", "blue jeans".

available_for_sale
•
boolean
When true, include only products available for sale.

When false, include unavailable items if they are a good match for the query.

include_secondhand
•
boolean
When true, include secondhand products in the results.

limit
•
integer
Default: 10
Maximum number of products to return (1-300).

max_price
•
number
Maximum price the buyer is willing to pay (without currency unit).

min_price
•
number
Minimum price the buyer is willing to pay (without currency unit).

products_limit
•
integer
Default: 10
The maximum number of products to return per universal product (1-10).

requires_selling_plan
•
boolean
When true, include only subscription products. When false, include only non-subscription products.

saved_catalog
•
string
The slug of a catalog saved through Dev Dashboard. While parameters set upon calling the search_global_products tool are applied, filters in the saved catalog always take precedence when a slug is provided.

ships_from
•
string
Filter by shipping origin (ISO country 
code
).

ships_to
•
string
Filter by shipping destination (ISO country 
code
).

shop_ids
•
array
Array of shop IDs to filter by specific shops.

POST
https://discover.shopifyapps.com/global/mcp
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      query: 'I need a crewneck sweater',
      context: 'buyer looking for sustainable fashion',
      limit: 3
    }
  }
}
{} Response
{
  "offers": [
    {
      "id": "gid://shopify/p/abc123def456",
      "title": "Organic Cotton Crewneck Sweater",
      "description": "A sustainably made crewneck sweater crafted from 100% organic cotton with a relaxed fit.",
      "images": [
        {
          "url": "https://cdn.shopify.com/s/files/example/organic-cotton-crewneck.jpg",
          "altText": "Organic Cotton Crewneck Sweater - EcoWear",
          "product": {
            "id": "gid://shopify/Product/1234567890",
            "title": "Organic Cotton Crewneck Sweater",
            "onlineStoreUrl": "https://ecowear-example.myshopify.com/products/organic-cotton-crewneck?variant=11111111111&_gsid=example123",
            "shop": {
              "name": "EcoWear",
              "onlineStoreUrl": "https://ecowear-example.myshopify.com"
            }
          }
        }
      ],
      "options": [
        {
          "name": "Size",
          "values": [
            { "value": "S", "availableForSale": true, "exists": true },
            { "value": "M", "availableForSale": true, "exists": true },
            { "value": "L", "availableForSale": true, "exists": true }
          ]
        },
        {
          "name": "Color",
          "values": [
            { "value": "Oatmeal", "availableForSale": true, "exists": true },
            { "value": "Forest Green", "availableForSale": true, "exists": true }
          ]
Examples
Use price and shipping filters
Narrow results by combining price range and shipping destination filters. This example searches for wireless headphones within a $50–$200 budget, only returning in-stock products that ship to the US.

POST
https://discover.shopifyapps.com/global/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "wireless headphones",
      "context": "buyer prefers noise-cancelling features, budget-conscious",
      "min_price": 50,
      "max_price": 200,
      "ships_to": "US",
      "available_for_sale": true,
      "limit": 15
    }
  }
}
Subscription products
Filter for products that require a selling plan to surface subscription-only offerings. This example finds coffee beans available as recurring subscriptions that ship to Canada.

POST
https://discover.shopifyapps.com/global/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "coffee beans",
      "context": "buyer interested in monthly coffee subscription",
      "requires_selling_plan": true,
      "ships_to": "CA",
      "limit": 5
    }
  }
}
Secondhand products
Include pre-owned and vintage items by enabling the secondhand filter. This example searches for leather jackets under $150, expanding results to include sustainable, secondhand options.

POST
https://discover.shopifyapps.com/global/mcp

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "vintage leather jacket",
      "context": "buyer looking for sustainable fashion options",
      "include_secondhand": true,
      "max_price": 150,
      "limit": 20
    }
  }
}
get_global_product_details
Retrieve detailed information about a specific product using its Universal Product ID (UPID) or a variant ID.

Identifier requirement
You must provide exactly one of upid or variant_id. Providing both returns an error.

Use this tool when a buyer is asking about a specific product and you have either the product ID or a variant ID. This tool returns comprehensive product information including all variants, detailed pricing, availability, and shop details.

When to use:

A buyer asks "Tell me more about this product" with a product link or ID.
You need to look up detailed information for a specific product.
You need to show variant options, pricing, and availability for a specific product.
You have a variant ID and need to find the Universal Product it belongs to.
Catalog API
The get_global_product_details tool wraps the Lookup and Lookup by variant endpoints of Catalog API, which can also be used depending on your use case.

Parameters
upid
•
string
Required*
The Universal Product ID (in Base62 encoded format). Required if variant_id is not provided.

variant_id
•
integer
Required*
A Shopify variant ID. Required if upid is not provided. Returns the Universal Product that the variant belongs to, with that variant ranked first in results.

_gsid
•
string
Reference to the Global Search that generated the URL.

available_for_sale
•
boolean
When true, include only products available for sale.

When false, include unavailable items if they're a good match for the query.

context
•
string
Additional information about the request.

include_secondhand
•
boolean
When true, include secondhand products in the result. This doesn't mean that only secondhand products will appear in the results.

limit
•
integer
Default: 10
Maximum number of offers to return for the product (1-100).

max_price
•
number
Maximum price the buyer is willing to pay.

min_price
•
number
Minimum price the buyer is willing to pay.

option_preferences
•
string
Comma-separated list of option names ranked by importance (for example, "Color,Size,Material"). Filters are relaxed starting with the least important option.

product_id
•
integer
Pins this product to the first position in results, regardless of relevance ranking.

product_options
•
array
Filter by product options such as color or size. Each item has key (option name) and values (array of option values).

query
•
string
Additional keyword search within the product.

ships_from
•
string
Filter by shipping origin (ISO country 
code
).

ships_to
•
string
Filter by shipping destination (ISO country 
code
).

shop_id
•
string
Filter by specific shop (numeric ID or Shop GID).

POST
https://discover.shopifyapps.com/global/mcp

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ"
    }
  }
}
{} Response
{
  "product": {
    "id": "gid://shopify/p/xyz789abc123",
    "title": "Organic Cotton Crewneck Sweater",
    "description": "A soft crewneck sweater crafted from 100% organic cotton with a relaxed fit for everyday comfort.",
    "images": [
      {
        "url": "https://cdn.shopify.com/s/files/example/organic-cotton-crewneck-front.jpg",
        "altText": "Organic Cotton Crewneck Sweater - Front"
      },
      {
        "url": "https://cdn.shopify.com/s/files/example/organic-cotton-crewneck-back.jpg",
        "altText": "Organic Cotton Crewneck Sweater - Back"
      },
      {
        "url": "https://cdn.shopify.com/s/files/example/organic-cotton-crewneck-detail.jpg",
        "altText": "Organic Cotton Crewneck Sweater - Detail"
      }
    ],
    "options": [
      {
        "name": "Size",
        "values": [
          { "value": "S", "availableForSale": true, "exists": true },
          { "value": "M", "availableForSale": true, "exists": true },
          { "value": "L", "availableForSale": true, "exists": true }
        ]
      }
    ],
    "priceRange": {
      "min": { "amount": "89.00", "currencyCode": "USD" },
      "max": { "amount": "89.00", "currencyCode": "USD" }
    },
    "products": [
      {
        "id": "gid://shopify/Product/1111111111111",
Examples
Lookup by variant ID
When you have a variant ID instead of a UPID, pass it directly. The response returns the Universal Product containing that variant, with the specified variant ranked first.

POST
https://discover.shopifyapps.com/global/mcp
Copy
1
2
3
4
5
6
7
8
9
10
11
12
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "variant_id": 43696935272470,
      "context": "buyer wants details on this specific variant"
    }
  }
}
Filter by product options
Narrow results to specific colors or sizes by passing an array of option key-value pairs. This example requests Blue or Navy in Medium or Large, with context about the buyer's preferences.

POST
https://discover.shopifyapps.com/global/mcp
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "product_options": [
        { "key": "Color", "values": ["Blue", "Navy"] },
        { "key": "Size", "values": ["Medium", "Large"] }
      ],
      "context": "buyer prefers darker colors and medium fit"
    }
  }
}
Price range and shipping
Combine price bounds with shipping destination to find offers within budget that can be delivered to the buyer's location.

POST
https://discover.shopifyapps.com/global/mcp
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "min_price": 20,
      "max_price": 100,
      "ships_to": "GB",
      "available_for_sale": true,
      "limit": 20
    }
  }
}
Option preferences for flexible matching
Rank option importance so filters relax gracefully when exact matches aren't available. Here, color takes priority over size. If red isn't in stock, size is relaxed first.

POST
https://discover.shopifyapps.com/global/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "product_options": [
        { "key": "Color", "values": ["Red"] },
        { "key": "Size", "values": ["Small"] }
      ],
      "option_preferences": "Color,Size",
      "context": "buyer strongly prefers red color, size is flexible"
    }
  }
}
Pin a specific shop and variant
Use shop_id and variant_id to force a particular offer to the top of results.

POST
https://discover.shopifyapps.com/global/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "shop_id": "gid://shopify/Shop/68817551382",
      "variant_id": 43696935272470,
      "include_secondhand": false
    }
  }
}
Workflow example
A typical workflow combines both tools: search first, then look up details.

Step 1: Search for products
Start by searching the global catalog with the buyer's query and preferences. The response includes product variants with UPIDs you can use for detailed lookups.

POST
https://discover.shopifyapps.com/global/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_global_products",
    "arguments": {
      "query": "glossier lip balm",
      "context": "buyer prefers light and bright colors",
      "ships_to": "US",
      "limit": 5
    }
  }
}
Step 2: Get details for a specific product
Use the UPID from search results to retrieve full product information. Add option filters to narrow down to the buyer's preferred variants.

POST
https://discover.shopifyapps.com/global/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 2,
  "params": {
    "name": "get_global_product_details",
    "arguments": {
      "upid": "AbC123XyZ",
      "product_options": [
        { "key": "Color", "values": ["Cherry", "Pink"] }
      ],
      "context": "buyer looking for subtle pink tones"
    }
  }
}
Best practices
Context is key: Always provide detailed context about the buyer's needs and preferences to get better results.
Price ranges: Use min_price and max_price to filter results within buyer budgets.
Shipping: Include ships_to for accurate shipping options and regional pricing.
Product options: When filtering by options, use option_preferences to specify which options are most important.
Availability: Set available_for_sale to true to avoid showing out-of-stock items.
Limit wisely: Start with reasonable limits (10-20) and increase only if needed.
Error handling: Check response status and provide helpful feedback to buyers.