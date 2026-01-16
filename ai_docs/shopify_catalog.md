---
title: About Shopify Catalog
description: >-
  Search and discover products across the global Shopify ecosystem using Catalog
  APIs.
source_url:
  html: 'https://shopify.dev/docs/agents/catalog'
  md: 'https://shopify.dev/docs/agents/catalog.md'
---

ExpandOn this page

* [How it works](https://shopify.dev/docs/agents/catalog.md#how-it-works)
* [Usage guidelines](https://shopify.dev/docs/agents/catalog.md#usage-guidelines)
* [Saved Catalogs](https://shopify.dev/docs/agents/catalog.md#saved-catalogs)
* [Next steps](https://shopify.dev/docs/agents/catalog.md#next-steps)

# About Shopify Catalog

Shopify Catalog contains products from merchants across the Shopify platform. The Catalog MCP serves as your foundation for agentic commerce, acting as the primary Discovery toolkit for implementing the [Universal Commerce Protocol (UCP)](https://ucp.dev/documentation/core-concepts/).

It allows you to search for products, refine the results with filters, and lookup details on individual products. That information can be used to render product details pages that allow buyers to click through and explore options on those results before adding items to their carts.

***

## How it works

Building agentic commerce experiences starts with discovering products. Your AI agent translates buyer prompts and preferences into queries against a Catalog.

How you perform that query largely depends on the needs of your agent experience:

* **[Catalog MCP](https://shopify.dev/docs/agents/catalog/mcp)**: For most use cases, we recommend building with the Catalog MCP. Provides MCP tools for searching Shopify products, as well as retrieving details on individual products. Catalog MCP requires [authentication via JWT tokens](https://shopify.dev/docs/agents/get-started/authentication).
* **[Storefront MCP](https://shopify.dev/docs/agents/catalog/storefront-mcp)**: Storefront MCP enables your agentic experiences to search for and discover products, but scoped to individual merchant stores. This can be beneficial to manage rate limits on Catalog MCP, or if your agent only serves a single shop. Storefront MCP doesn't require authentication.
* **[Catalog REST API](https://shopify.dev/docs/api/catalog-api)**: Catalog MCP wraps this REST API, but you can also query the Catalog API directly.

Whichever path you choose for your agents, each has two main endpoints that help buyers discover products: Search and Lookup.

![Sequence diagram showing AI chat user asking for running shoes, AI partner querying Shopify Catalog, and redirecting to merchant checkout](https://shopify.dev/assets/assets/images/agents/agent-light-icons-C5jZgSSt.png)

### Search

Use the Search to find products across all eligible Shopify merchants based on buyer preferences like keywords, price range, and shipping location.

For each API this is performed with:

* **Catalog MCP**: The [`search_global_products`](https://shopify.dev/docs/agents/catalog/catalog-mcp#search_global_products) tool
* **Storefront MCP**: The [`search_shop_catalog`](https://shopify.dev/docs/agents/catalog/storefront-mcp#search_shop_catalog) tool
* **Catalog REST API**: The [`Search`](https://shopify.dev/docs/api/catalog-api/search) endpoint

Search results are clustered by Universal Product ID (UPID), which prevents duplicate products from appearing when the same item is sold by multiple merchants. Each result includes:

* Product details (title, description, images)
* Price range across all offers
* Available options (size, color, etc.)
* A list of shops selling the product with their specific prices and checkout URLs
* Universal Product ID, used with the Lookup endpoint to retrieve data on a specific product

### Lookup

Unique Universal Product IDs (UPIDs) (and variant IDs) for each Search result can be used to render product details pages that allow buyers to click through and explore options on those results.

* **Catalog MCP**: The [`get_global_product_details`](https://shopify.dev/docs/agents/catalog/catalog-mcp#get_global_product_details) tool
* **Catalog REST API**: The [`Lookup`](https://shopify.dev/docs/api/catalog-api/lookup) and [`Lookup by variant`](https://shopify.dev/docs/api/catalog-api/lookup) endpoints

Lookup has also been designed to help your agents render product detail pages with relaxation logic around available options with [options preferences](https://shopify.dev/docs/api/catalog-api/lookup#examples).

The Lookup endpoint returns comprehensive variant information, including:

* All available product options and option combinations
* Detailed pricing for each variant
* Checkout URLs for each shop's offer
* Robust data about the product to empower agent-to-buyer conversations (for example description, key features, and tech specs)

***

## Usage guidelines

These usage guidelines apply to both the Catalog MCP server and the Catalog API:

* **Don't cache or re-use images**: Images may only be used in connection with the related merchant's product listing and must be rendered in real-time (not downloaded to servers).
* **Don't cache search results**: Catalog results reflect merchant preferences on pricing, availability, and presentation. Caching results isn't allowed.
* **Rate limits**: During the testing phase, Catalog queries are subject to rate limits.
* **Inferred fields**: Some fields might be inferred by Shopify's AI. These fields may not always be present or may have varying accuracy depending on the available product data. Inferred fields are denoted throughout the Catalog MCP and API reference docs.
* **Endpoint URLs may change**: API URLs are subject to change.

***

## Saved Catalogs

For both the Catalog MCP server or the Catalog API, your agents can search Shopify's global catalog of products. These requests will return responses that will contain products from any of the eligible merchants on the Shopify platform.

You can modify these requests with parameters at runtime, whether that be price range, shipping origin, shops, or Product Taxonomies, to better suit your buyers.

You can also save a Catalog through Dev Dashboard, if your requests consistently contain the same parameters.

![Dev Dashboard Catalog create + overrides](https://shopify.dev/assets/assets/images/agents/catalog-with-overrides-ucp-CzDyhJ1m.png)

Catalog filter options include:

* **Inputs**: Whether the Catalog queries all of Shopify or products from a specific store.
* **Overrides**: Custom filters applied to queries that limit results by attributes like only those belonging to certain Taxonomy category IDs.
* **Access**: Where the custom URL for your saved Catalog can be retrieved, as well as requesting access to additional features related to agentic commerce.

You can run your catalog and see requests from the **Preview** panel. Once you're happy with the results, click **Save**.

***

## Next steps

[Search the Catalog\
\
](https://shopify.dev/docs/agents/get-started/search-catalog)

[Walk through product discovery end-to-end.](https://shopify.dev/docs/agents/get-started/search-catalog)

[Catalog MCP reference\
\
](https://shopify.dev/docs/agents/catalog/catalog-mcp)

[Reference for UCP-compliant product discovery on Shopify.](https://shopify.dev/docs/agents/catalog/catalog-mcp)

[Catalog REST API\
\
](https://shopify.dev/docs/api/catalog-api)

[Query the Catalog API directly.](https://shopify.dev/docs/api/catalog-api)

[Storefront MCP\
\
](https://shopify.dev/docs/agents/catalog/storefront-mcp)

[Search products scoped to individual merchant stores.](https://shopify.dev/docs/agents/catalog/storefront-mcp)

***

* [How it works](https://shopify.dev/docs/agents/catalog.md#how-it-works)
* [Usage guidelines](https://shopify.dev/docs/agents/catalog.md#usage-guidelines)
* [Saved Catalogs](https://shopify.dev/docs/agents/catalog.md#saved-catalogs)
* [Next steps](https://shopify.dev/docs/agents/catalog.md#next-steps)