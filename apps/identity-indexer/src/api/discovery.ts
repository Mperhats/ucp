import {
  UcpDiscoveryProfileSchema,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

export const DEFAULT_UCP_VERSION = "2026-01-11";

interface DiscoveryProfileArgs {
  ucpVersion: string;
  endpointBase: string;
}

export function buildDiscoveryProfile(
  args: DiscoveryProfileArgs
): UcpDiscoveryProfile {
  return UcpDiscoveryProfileSchema.parse({
    ucp: {
      version: args.ucpVersion,
      services: {
        "dev.ucp.shopping": {
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping",
          rest: {
            schema: "https://ucp.dev/services/shopping/openapi.json",
            endpoint: args.endpointBase,
          },
        },
      },
      capabilities: [
        {
          name: "dev.ucp.shopping.catalog",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/catalog",
          schema: "https://ucp.dev/schemas/shopping/catalog.json",
        },
        {
          name: "dev.ucp.shopping.checkout",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/checkout",
          schema: "https://ucp.dev/schemas/shopping/checkout.json",
        },
        {
          name: "dev.ucp.shopping.order",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/order",
          schema: "https://ucp.dev/schemas/shopping/order.json",
        },
        {
          name: "dev.ucp.shopping.refund",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/refund",
          schema: "https://ucp.dev/schemas/shopping/refund.json",
          extends: "dev.ucp.shopping.order",
        },
        {
          name: "dev.ucp.shopping.return",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/return",
          schema: "https://ucp.dev/schemas/shopping/return.json",
          extends: "dev.ucp.shopping.order",
        },
        {
          name: "dev.ucp.shopping.dispute",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/dispute",
          schema: "https://ucp.dev/schemas/shopping/dispute.json",
          extends: "dev.ucp.shopping.order",
        },
        {
          name: "dev.ucp.shopping.discount",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/discount",
          schema: "https://ucp.dev/schemas/shopping/discount.json",
          extends: "dev.ucp.shopping.checkout",
        },
        {
          name: "dev.ucp.shopping.fulfillment",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/fulfillment",
          schema: "https://ucp.dev/schemas/shopping/fulfillment.json",
          extends: "dev.ucp.shopping.checkout",
        },
        {
          name: "dev.ucp.shopping.buyer_consent",
          version: args.ucpVersion,
          spec: "https://ucp.dev/specs/shopping/buyer_consent",
          schema: "https://ucp.dev/schemas/shopping/buyer_consent.json",
          extends: "dev.ucp.shopping.checkout",
        },
      ],
    },
    payment: {
      handlers: [
        {
          id: "shop_pay",
          name: "com.shopify.shop_pay",
          version: args.ucpVersion,
          spec: "https://shopify.dev/ucp/handlers/shop_pay",
          config_schema: "https://shopify.dev/ucp/handlers/shop_pay/config.json",
          instrument_schemas: [
            "https://shopify.dev/ucp/handlers/shop_pay/instrument.json",
          ],
          config: {
            shop_id: "test-shop-id",
          },
        },
        {
          id: "google_pay",
          name: "google.pay",
          version: "1.0",
          spec: "https://example.com/spec",
          config_schema: "https://example.com/schema",
          instrument_schemas: [],
          config: {},
        },
        {
          id: "mock_payment_handler",
          name: "dev.ucp.mock_payment",
          version: "1.0",
          spec: "https://ucp.dev/specs/mock",
          config_schema: "https://ucp.dev/schemas/mock.json",
          instrument_schemas: [
            "https://ucp.dev/schemas/shopping/types/card_payment_instrument.json",
          ],
          config: {
            supported_tokens: ["success_token", "fail_token"],
          },
        },
      ],
    },
    signing_keys: [
      {
        kid: "mock-signing-key",
        kty: "RSA",
        use: "sig",
      },
    ],
  });
}
