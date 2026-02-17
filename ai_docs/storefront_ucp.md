
While Catalog MCP provides discovery capabilities across Shopify's entire ecosystem of stores, Storefront MCP connects to an individual merchant's catalog and store policies. You can then connect Checkout MCP and Embedded checkout to make a purchase.

Storefront MCP discovery tasks for single merchants include:

Searching the store's product catalog and finding items that match customer needs.
Answering questions about store policies, FAQs, and services.
See the expanded Storefront MCP reference for more details.

When to use Storefront MCP
For most Universal Commerce Protocol use cases, we recommend Catalog MCP over Storefront MCP or even the Catalog REST API.

There are cases where it makes more sense to use Storefront MCP when building agents:

You are building agents like a Storefront AI agent that is only meant to help buyers interact with a single merchant.
You are prototyping agentic commerce capabilities and want to perform discovery tasks without authenticating through Dev Dashboard.
Storefront MCP is not restricted by the same kind of rate-limiting found in Catalog MCP that can prevent some Partners from building what they'd like.
Connect to the server
Each Shopify store has its own MCP server endpoint that exposes storefront features. This endpoint handles all server calls for product search, cart operations, and policy questions.

Replace storedomain with the store's actual domain. No authentication is required.

POST
https://{storedomain}/api/mcp
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