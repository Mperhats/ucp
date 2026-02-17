Yep — Merchant Center “product-feed discovery” is **Google’s global index layer** for shopping. For UCP-on-Google, the technical contract is:

1. **You publish products into Merchant Center** (feeds or APIs). Google indexes them and uses them to render product cards on Google surfaces. ([Google for Developers][1])
2. You **opt individual items into agentic/native checkout** via extra feed signals (`native_commerce`, `consumer_notice`, and ID-mapping if needed). Google’s UCP guide recommends doing this via a **supplemental feed** so you don’t disrupt your primary feed. ([Google for Developers][2])
3. When a user clicks **Buy**, Google calls your **UCP checkout endpoint** (`POST /checkout-sessions`) and the `line_items[].item.id` **must match your Product Feed ID**. ([Google for Developers][3])

Below is the “deep technical” view, plus sample code you can actually run.

---

## How Merchant Center discovery works (mechanically)

### What Google indexes

Merchants provide product data through:

* **File feeds** (TSV / XML / Google Sheets / scheduled fetch), or
* **APIs** (Content API for Shopping, or the newer **Merchant API**) ([Google Help][4])

The canonical baseline attributes (ID, title, link, image, price, availability, etc.) are documented in Google’s Product Data Specification; the key point for UCP is the **`id`** is required, max 50 chars, and should stay stable. ([Google Help][4])

### What makes an item “UCP-buyable” on Google

Google’s UCP guide adds three required concepts:

1. **Eligibility flag:** `native_commerce` boolean

   * if false or missing → **not eligible** for checkout on Google surfaces ([Google for Developers][2])

2. **Warnings when required:** `consumer_notice` group

   * `consumer_notice_type` in `{legal_disclaimer, safety_warning, prop_65}`
   * `consumer_notice_message` up to 1000 chars; `<b>`, `<br>`, `<i>` allowed ([Google for Developers][2])

3. **ID alignment:** feed `id` ↔ checkout `item.id`

   * feed `id` must match what your Checkout API expects
   * otherwise use `merchant_item_id` custom attribute to map ([Google for Developers][2])

### Why supplemental feeds matter

Google recommends a **supplemental data source** for these new attributes (so you don’t break your primary ingestion if you make a formatting mistake). ([Google for Developers][2])

If you want to do supplemental-feed updates via API:

* you **must create** the supplemental feed in Merchant Center UI first; you **can’t create** it purely via the Content API. ([Google for Developers][5])

---

## Concrete examples of the UCP-specific feed payload

### A) Supplemental TSV example (exactly the shape Google shows)

From Google’s UCP guide: ([Google for Developers][2])

```tsv
ID	native_commerce	consumer_notice
11111	TRUE	prop_65:This product can expose you...
22222	TRUE
33333	FALSE
```

### B) Supplemental XML example (exactly the shape Google shows)

([Google for Developers][2])

```xml
<item>
  <g:id>11111</g:id>
  <g:native_commerce>TRUE</g:native_commerce>
  <g:consumer_notice>
    <g:consumer_notice_type>prop_65</g:consumer_notice_type>
    <g:consumer_notice_message>
      This product can expose you to chemicals...
    </g:consumer_notice_message>
  </g:consumer_notice>
</item>
```

---

## The single most important “bridge” into UCP

When Google starts checkout, it sends:

```json
{
  "line_items": [
    { "item": { "id": "product_12345" }, "quantity": 1 }
  ],
  "currency": "USD"
}
```

…and Google’s native-checkout doc calls out that `item.id` **must match Product Feed ID**. ([Google for Developers][3])

So your engineering job is: **make sure the ID in Merchant Center is the same identifier your commerce backend can resolve into a variant/SKU** (or provide a mapping via `merchant_item_id`). ([Google for Developers][2])

---

## Sample code

### 1) Generate a supplemental TSV for `native_commerce` + `consumer_notice`

This is the simplest way to start (host the file somewhere and set up scheduled fetch, or upload it).

```python
# generate_ucp_supplemental_feed.py
import csv

rows = [
    {"ID": "11111", "native_commerce": "TRUE", "consumer_notice": "prop_65:This product can expose you to chemicals..."},
    {"ID": "22222", "native_commerce": "TRUE", "consumer_notice": ""},
    {"ID": "33333", "native_commerce": "FALSE", "consumer_notice": ""},
]

with open("ucp_supplemental.tsv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["ID", "native_commerce", "consumer_notice"], delimiter="\t")
    writer.writeheader()
    writer.writerows(rows)

print("Wrote ucp_supplemental.tsv")
```

This matches Google’s documented text-feed layout for these fields. ([Google for Developers][2])

---

### 2) Content API for Shopping: insert a product with UCP attributes as `customAttributes`

Google’s UCP guide says that if you use the **Content API**, you must provide these UCP attributes as **custom attributes**, and they must be included in a **full `products.insert`** because `products.update` doesn’t support updating `customAttributes`. ([Google for Developers][2])

Here’s a minimal Python example (you’ll need OAuth credentials with the `https://www.googleapis.com/auth/content` scope):

```python
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

MERCHANT_ID = "123456789"  # your Merchant Center ID

# creds should be an OAuth2 Credentials object with scope: https://www.googleapis.com/auth/content
creds = Credentials(token="ACCESS_TOKEN")  # replace with real OAuth flow
service = build("content", "v2.1", credentials=creds)

product = {
  "offerId": "11111",                 # your feed item id / offer id
  "title": "Canned Coke",
  "description": "Best soda pop ever made",
  "link": "https://shop.example.com/products/canned-coke",
  "imageLink": "https://cdn.example.com/canned-coke.jpg",
  "contentLanguage": "en",
  "targetCountry": "US",
  "channel": "online",
  "availability": "in stock",
  "condition": "new",
  "price": { "value": "7.00", "currency": "USD" },

  # UCP-required attributes as custom attributes
  "customAttributes": [
    {
      "name": "native commerce",
      "groupValues": [{"name": "checkout eligibility", "value": "true"}]
    },
    {
      "name": "consumer notice",
      "groupValues": [
        {"name": "notice type", "value": "prop_65"},
        {"name": "notice message", "value": "This product can expose you to chemicals..."}
      ]
    },
    # Optional mapping if your checkout backend expects a different ID
    {"name": "merchant item id", "value": "internal_sku_987"}
  ]
}

resp = service.products().insert(merchantId=MERCHANT_ID, body=product).execute()
print(resp.get("kind"), resp.get("offerId"))
```

This uses the documented `CustomAttribute` structure (`name`, plus either `value` or `groupValues`). ([Google for Developers][6])

> Note: Content API is being succeeded by the Merchant API, and Google has announced a sunset date for Content API (Aug 18, 2026). ([Google for Developers][7])

---

### 3) Merchant API: patch just the UCP custom attributes (recommended for “frequent updates”)

Google’s UCP guide explicitly supports using **Merchant API** and updating custom attributes using `accounts.productInputs.patch`. ([Google for Developers][2])
The patch method supports an `updateMask`, and for custom attributes you use the `custom_attribute.` prefix. ([Google for Developers][8])

Here’s an HTTP-shaped example (you’d attach an OAuth Bearer token with `https://www.googleapis.com/auth/content` scope):

```bash
curl -X PATCH \
  "https://merchantapi.googleapis.com/products/v1/accounts/ACCOUNT_ID/productInputs/en~US~11111?dataSource=accounts/ACCOUNT_ID/dataSources/DATASOURCE_ID&updateMask=custom_attribute" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customAttributes": [
      {
        "name": "native commerce",
        "groupValues": [
          { "name": "checkout eligibility", "value": "true" }
        ]
      },
      {
        "name": "consumer notice",
        "groupValues": [
          { "name": "notice type", "value": "prop_65" },
          { "name": "notice message", "value": "This product can expose you to chemicals..." }
        ]
      }
    ]
  }'
```

The key bits here (straight from the Merchant API reference):

* `dataSource=accounts/{account}/dataSources/{datasource}` is required and only API data sources are supported ([Google for Developers][8])
* `updateMask` rules and the `custom_attribute.` prefix for custom attributes ([Google for Developers][8])

---

## One subtle but crucial point about “discovery”

If you’re thinking “I want an API that lets my app query Google’s global product index,” that’s **not what Merchant Center APIs are for**. Merchant Center APIs are primarily for **merchants managing their own inventory** (upload/list/update) — Google’s *consumer discovery surfaces* (Search/Gemini) are where the global index is exposed to users.

So the replicable pattern (for your own network/product) is:

* **Index ingestion format** (Merchant Center feed equivalent) → normalize to offer cards
* **Stable offer IDs** (feed `id`) → used verbatim as `item.id` in UCP checkout ([Google for Developers][3])

---

If you want, paste (or describe) what your commerce backend uses as its “buyable ID” (SKU, variant ID, database PK, etc.) and I’ll show the cleanest mapping strategy so: **feed ID = checkout item.id** without a fragile lookup layer.

[1]: https://developers.google.com/merchant/ucp/guides "Overview  |  Google Universal Commerce Protocol (UCP) Guide  |  Google for Developers"
[2]: https://developers.google.com/merchant/ucp/guides/merchant-center "Prepare your Merchant Center account  |  Google Universal Commerce Protocol (UCP) Guide  |  Google for Developers"
[3]: https://developers.google.com/merchant/ucp/guides/checkout/native "Native checkout  |  Google Universal Commerce Protocol (UCP) Guide  |  Google for Developers"
[4]: https://support.google.com/merchants/answer/7052112?hl=en "Product data specification - Google Merchant Center Help"
[5]: https://developers.google.com/shopping-content/guides/products/supplemental-feeds/creating-supplemental-feeds "Create supplemental feeds  |  Content API for Shopping  |  Google for Developers"
[6]: https://developers.google.com/shopping-content/reference/rest/v2.1/CustomAttribute "CustomAttribute  |  Content API for Shopping  |  Google for Developers"
[7]: https://developers.google.com/shopping-content/guides/quickstart "Get started  |  Content API for Shopping  |  Google for Developers"
[8]: https://developers.google.com/merchant/api/reference/rest/products_v1/accounts.productInputs/patch?utm_source=chatgpt.com "Method: accounts.productInputs.patch | Merchant API"
