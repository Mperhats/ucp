If your goal is “show me this merchant’s items in my UI,” the important nuance is:

* **UCP (v2026-01-11) standardizes the *commerce lifecycle primitives* (checkout, identity linking, orders) and the *discovery/negotiation machinery*** (profiles, capability negotiation, endpoint resolution). ([Universal Commerce Protocol][1])
* **Shopify’s *product discovery* for a specific merchant is delivered (today) via Shopify’s Catalog/Storefront MCP tooling**, which Shopify positions as the “primary Discovery toolkit” for implementing UCP experiences. ([Shopify][2])

So in practice, “fetch items for sale from a merchant” on Shopify looks like:

## 1) UCP layer: discover the merchant’s UCP profile (what they support, where to call)

UCP’s core “bootstrapping” step is:

**GET `https://{merchant-domain}/.well-known/ucp`**

The spec calls this the **Business Profile**, and it’s the anchor for:

* protocol version,
* supported services/transports (REST/MCP/A2A),
* and declared capabilities/extensions. ([Universal Commerce Protocol][1])

UCP also defines **endpoint resolution**: the profile tells you the base URL, and you append the OpenAPI paths from the service schema. ([Universal Commerce Protocol][1])

That matters because even if you do discovery via Shopify’s Storefront MCP, you’ll often use the UCP profile later for checkout/orders (and for signature verification / key discovery on webhooks).

## 2) Shopify layer (merchant-scoped discovery): call the merchant’s Storefront MCP endpoint

For **a specific Shopify store**, Shopify provides a per-store MCP endpoint:

**POST `https://{storedomain}/api/mcp`** (no auth required) ([Shopify][3])

You then call the **`search_shop_catalog` tool**, which is explicitly described as: “Searches the store’s product catalog…” ([Shopify][3])

### The exact request shape (JSON-RPC / MCP “tools/call”)

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "search_shop_catalog",
    "arguments": {
      "query": "organic coffee beans",
      "context": "Customer prefers fair trade products"
    }
  }
}
```

This is straight from Shopify’s Storefront MCP docs. ([Shopify][3])

### What you get back (what you render in the UI)

Shopify documents that the response includes, at minimum: ([Shopify][3])

* product name
* price + currency
* **variant ID** (critical: this is what you’ll use for cart/checkout operations)
* product URL + image URL
* description

So your UI rendering flow is typically:

1. User lands on merchant page → you call `search_shop_catalog` with a broad query (“new arrivals”, “best sellers”, category keywords, etc.).
2. Render cards from returned items: title, image_url, price, short description.
3. When user selects an item, treat the **variant ID** as the “buyable SKU handle” for subsequent cart/checkout.

### Discover richer tool schemas dynamically (important for “deep technical”)

Shopify explicitly recommends using `tools/list` to discover available tools and their full parameter/response schemas. ([Shopify][4])

That’s a big deal because:

* your UI can adapt to stores that expose additional tools,
* and you can generate strongly-typed clients from the tool schemas.

## 3) If you want global search then “show which merchants sell it,” use Shopify Catalog (not Storefront MCP)

If instead your UI is like “search across Shopify then pick a merchant,” Shopify’s **Catalog** docs describe:

* **Search** returns results clustered by UPID and includes a list of shops selling the item (with prices + checkout URLs). ([Shopify][2])
* **Lookup** returns comprehensive variant info for a selected UPID/variant. ([Shopify][2])

And Shopify’s usage rules matter for UI implementation:

* **don’t cache images** and **don’t cache search results** (results can change with pricing/availability/presentation). ([Shopify][2])

## 4) Where UCP signatures enter the picture (and why discovery often stays “public”)

Even though Storefront MCP discovery is unauthenticated, **UCP’s transactional calls** (checkout, order webhooks) are designed around authenticated/signed messaging:

* The UCP Shopping REST binding includes a required `Request-Signature` header. ([Universal Commerce Protocol][5])
* Webhooks (business → platform) are signed using a **detached JWT** and verified via keys published in the business profile (`/.well-known/ucp`). ([Universal Commerce Protocol][6])

So the common pattern is:

* **Discovery:** public/low-friction (Storefront MCP or Catalog)
* **Transaction:** signed + negotiated (UCP checkout/orders)

## 5) “Pure UCP” catalog fetching (what you *can* do, but isn’t standardized in the initial spec)

UCP is explicitly designed so merchants can add bespoke functionality via **vendor capabilities** in their own domain namespace, and platforms can validate that by namespace/domain binding (no central registry). ([Shopify][7])

So if a merchant wanted a first-class catalog endpoint under UCP, they could advertise something like `com.merchant.catalog` in their `/.well-known/ucp` profile and provide an OpenAPI schema + endpoint for it—**but the exact request/response would be defined by that merchant’s spec**, not the `dev.ucp.*` baseline.

That’s why, today, Shopify’s “how do I fetch products to show in UI?” answer is effectively: **use Storefront MCP (`search_shop_catalog`) for merchant-scoped discovery.** ([Shopify][3])

---

If you tell me the exact UI you mean (category pages vs global search vs “browse everything”), I can outline the most reliable calling pattern (including pagination strategy and how to avoid caching pitfalls) using the real tool schemas (`tools/list`) that Shopify exposes.

[1]: https://ucp.dev/specification/overview/ "Overview - Universal Commerce Protocol (UCP)"
[2]: https://shopify.dev/docs/agents/catalog "About Shopify Catalog"
[3]: https://shopify.dev/docs/agents/catalog/storefront-mcp "Storefront MCP server"
[4]: https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront "Storefront MCP server"
[5]: https://ucp.dev/specification/checkout-rest/?utm_source=chatgpt.com "HTTP/REST Binding - Universal Commerce Protocol (UCP)"
[6]: https://ucp.dev/specification/order/?utm_source=chatgpt.com "Order Capability - Universal Commerce Protocol (UCP)"
[7]: https://shopify.engineering/ucp "Building the Universal Commerce Protocol (2026) - Shopify"
