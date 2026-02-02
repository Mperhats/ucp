import * as z from "zod";

// Key usage. Should be 'sig' for signing keys.

export const UseSchema = z.enum([
    "enc",
    "sig",
]);
export type Use = z.infer<typeof UseSchema>;

// Delivery status.
//
// Delivery lifecycle event type.

export const DeliveryStatusSchema = z.enum([
    "canceled",
    "delivered",
    "dropoff",
    "ongoing",
    "pending",
    "pickup",
    "pickup_complete",
    "returned",
]);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

// Content format, default = plain.

export const ContentTypeSchema = z.enum([
    "markdown",
    "plain",
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

// Declares who resolves this error. 'recoverable': agent can fix via API.
// 'requires_buyer_input': merchant requires information their API doesn't support
// collecting programmatically (checkout incomplete). 'requires_buyer_review': buyer must
// authorize before order placement due to policy, regulatory, or entitlement rules
// (checkout complete). Errors with 'requires_*' severity contribute to 'status:
// requires_escalation'.

export const SeveritySchema = z.enum([
    "recoverable",
    "requires_buyer_input",
    "requires_buyer_review",
]);
export type Severity = z.infer<typeof SeveritySchema>;


export const MessageTypeSchema = z.enum([
    "error",
    "info",
    "warning",
]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

// Type of total categorization.

export const TotalResponseTypeSchema = z.enum([
    "discount",
    "fee",
    "fulfillment",
    "items_discount",
    "subtotal",
    "tax",
    "total",
]);
export type TotalResponseType = z.infer<typeof TotalResponseTypeSchema>;

// Fulfillment method type this availability applies to.
//
// Selected fulfillment type for this order.

export const RestaurantFulfillmentMethodCreateRequestTypeSchema = z.enum([
    "on_demand_delivery",
    "pickup",
]);
export type RestaurantFulfillmentMethodCreateRequestType = z.infer<typeof RestaurantFulfillmentMethodCreateRequestTypeSchema>;

// Media type discriminator.

export const MediaTypeSchema = z.enum([
    "image",
    "model_3d",
    "video",
]);
export type MediaType = z.infer<typeof MediaTypeSchema>;

// The type of card number. Network tokens are preferred with fallback to FPAN. See PCI
// Scope for more details.

export const CardNumberTypeSchema = z.enum([
    "dpan",
    "fpan",
    "network_token",
]);
export type CardNumberType = z.infer<typeof CardNumberTypeSchema>;

// A URI pointing to a schema definition (e.g., JSON Schema) used to validate the structure
// of the instrument object.

export const CardPaymentInstrumentTypeSchema = z.enum([
    "card",
]);
export type CardPaymentInstrumentType = z.infer<typeof CardPaymentInstrumentTypeSchema>;

// Type of total categorization.

export const RestaurantTotalResponseTypeSchema = z.enum([
    "discount",
    "fee",
    "fulfillment",
    "items_discount",
    "subtotal",
    "tax",
    "tip",
    "total",
]);
export type RestaurantTotalResponseType = z.infer<typeof RestaurantTotalResponseTypeSchema>;

// Checkout state indicating the current phase and required action. See Checkout Status
// lifecycle documentation for state transition details.

export const CheckoutRestaurantExtensionResponseStatusSchema = z.enum([
    "canceled",
    "complete_in_progress",
    "completed",
    "incomplete",
    "ready_for_complete",
    "requires_escalation",
]);
export type CheckoutRestaurantExtensionResponseStatus = z.infer<typeof CheckoutRestaurantExtensionResponseStatusSchema>;

// Adjustment status.

export const AdjustmentStatusSchema = z.enum([
    "completed",
    "failed",
    "pending",
]);
export type AdjustmentStatus = z.infer<typeof AdjustmentStatusSchema>;

// Pickup lifecycle event type aligned with pickup status values.
//
// Delivery lifecycle event type.
//
// Derived fulfillment status from the latest pickup or delivery event log.

export const RestaurantFulfillmentEventEventTypeSchema = z.enum([
    "arrived",
    "canceled",
    "completed",
    "delivered",
    "dropoff",
    "ongoing",
    "pending",
    "pickup",
    "pickup_complete",
    "ready",
    "returned",
]);
export type RestaurantFulfillmentEventEventType = z.infer<typeof RestaurantFulfillmentEventEventTypeSchema>;

// Pickup lifecycle event type aligned with pickup status values.

export const EventTypeSchema = z.enum([
    "arrived",
    "canceled",
    "completed",
    "ready",
]);
export type EventType = z.infer<typeof EventTypeSchema>;

// Error codes specific to AP2 mandate verification.

export const Ap2ErrorCodeSchema = z.enum([
    "agent_missing_key",
    "mandate_expired",
    "mandate_invalid_signature",
    "mandate_required",
    "mandate_scope_mismatch",
    "merchant_authorization_invalid",
    "merchant_authorization_missing",
]);
export type Ap2ErrorCode = z.infer<typeof Ap2ErrorCodeSchema>;

// Allocation method. 'each' = applied independently per item. 'across' = split
// proportionally by value.

export const MethodSchema = z.enum([
    "across",
    "each",
]);
export type Method = z.infer<typeof MethodSchema>;

// Fulfillment method type.
//
// Fulfillment method type this availability applies to.

export const TypeElementSchema = z.enum([
    "pickup",
    "shipping",
]);
export type TypeElement = z.infer<typeof TypeElementSchema>;

// Delivery method type (shipping, pickup, digital).

export const MethodTypeSchema = z.enum([
    "digital",
    "pickup",
    "shipping",
]);
export type MethodType = z.infer<typeof MethodTypeSchema>;

// Derived status: fulfilled if quantity.fulfilled == quantity.total, partial if
// quantity.fulfilled > 0, otherwise processing.

export const LineItemStatusSchema = z.enum([
    "fulfilled",
    "partial",
    "processing",
]);
export type LineItemStatus = z.infer<typeof LineItemStatusSchema>;


export const MessageErrorTypeSchema = z.enum([
    "error",
]);
export type MessageErrorType = z.infer<typeof MessageErrorTypeSchema>;


export const MessageInfoTypeSchema = z.enum([
    "info",
]);
export type MessageInfoType = z.infer<typeof MessageInfoTypeSchema>;


export const MessageWarningTypeSchema = z.enum([
    "warning",
]);
export type MessageWarningType = z.infer<typeof MessageWarningTypeSchema>;

export const PaymentHandlerResponseSchema = z.object({
    "config": z.record(z.string(), z.any()),
    "config_schema": z.string(),
    "id": z.string(),
    "instrument_schemas": z.array(z.string()),
    "name": z.string(),
    "spec": z.string(),
    "version": z.string(),
});
export type PaymentHandlerResponse = z.infer<typeof PaymentHandlerResponseSchema>;

export const SigningKeySchema = z.object({
    "alg": z.string().optional(),
    "crv": z.string().optional(),
    "e": z.string().optional(),
    "kid": z.string(),
    "kty": z.string(),
    "n": z.string().optional(),
    "use": UseSchema.optional(),
    "x": z.string().optional(),
    "y": z.string().optional(),
});
export type SigningKey = z.infer<typeof SigningKeySchema>;

export const CapabilityDiscoverySchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string(),
    "schema": z.string(),
    "spec": z.string(),
    "version": z.string(),
});
export type CapabilityDiscovery = z.infer<typeof CapabilityDiscoverySchema>;

export const A2ASchema = z.object({
    "endpoint": z.string(),
});
export type A2A = z.infer<typeof A2ASchema>;

export const EmbeddedSchema = z.object({
    "schema": z.string(),
});
export type Embedded = z.infer<typeof EmbeddedSchema>;

export const McpSchema = z.object({
    "endpoint": z.string(),
    "schema": z.string(),
});
export type Mcp = z.infer<typeof McpSchema>;

export const RestSchema = z.object({
    "endpoint": z.string(),
    "schema": z.string(),
});
export type Rest = z.infer<typeof RestSchema>;

export const BaseSchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string().optional(),
    "schema": z.string().optional(),
    "spec": z.string().optional(),
    "version": z.string().optional(),
});
export type Base = z.infer<typeof BaseSchema>;

export const LocationClassSchema = z.object({
    "lat": z.number().optional(),
    "lng": z.number().optional(),
});
export type LocationClass = z.infer<typeof LocationClassSchema>;

export const ShippingDestinationResponseSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string(),
});
export type ShippingDestinationResponse = z.infer<typeof ShippingDestinationResponseSchema>;

export const PriceSchema = z.object({
    "amount": z.number(),
    "currency": z.string(),
});
export type Price = z.infer<typeof PriceSchema>;

export const BillingAddressClassSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
});
export type BillingAddressClass = z.infer<typeof BillingAddressClassSchema>;

export const MessageSchema = z.object({
    "code": z.string().optional(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "severity": SeveritySchema.optional(),
    "type": MessageTypeSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const ResponseSchema = z.object({
    "cursor": z.string().optional(),
    "has_next_page": z.boolean().optional(),
    "total_count": z.number().optional(),
});
export type Response = z.infer<typeof ResponseSchema>;

export const CapabilityResponseSchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string(),
    "schema": z.string().optional(),
    "spec": z.string().optional(),
    "version": z.string(),
});
export type CapabilityResponse = z.infer<typeof CapabilityResponseSchema>;

export const ShippingDestinationRequestSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string().optional(),
});
export type ShippingDestinationRequest = z.infer<typeof ShippingDestinationRequestSchema>;

export const RetailLocationRequestSchema = z.object({
    "address": BillingAddressClassSchema.optional(),
    "name": z.string(),
});
export type RetailLocationRequest = z.infer<typeof RetailLocationRequestSchema>;

export const PurpleContextSchema = z.object({
    "country": z.string().optional(),
    "postal_code": z.string().optional(),
    "region": z.string().optional(),
});
export type PurpleContext = z.infer<typeof PurpleContextSchema>;

export const DeliveryInputsRequestSchema = z.object({
    "dropoff": ShippingDestinationRequestSchema,
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "items_value": PriceSchema,
    "pickup": RetailLocationRequestSchema,
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type DeliveryInputsRequest = z.infer<typeof DeliveryInputsRequestSchema>;

export const TotalResponseSchema = z.object({
    "amount": z.number(),
    "display_text": z.string().optional(),
    "type": TotalResponseTypeSchema,
});
export type TotalResponse = z.infer<typeof TotalResponseSchema>;

export const DeliveryUpdateRequestUpdateRequestSchema = z.object({
    "dropoff": ShippingDestinationRequestSchema.optional(),
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "items_value": PriceSchema.optional(),
    "pickup": RetailLocationRequestSchema.optional(),
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type DeliveryUpdateRequestUpdateRequest = z.infer<typeof DeliveryUpdateRequestUpdateRequestSchema>;

export const DeliveryQuoteRequestUpdateRequestSchema = z.object({
    "context": PurpleContextSchema.optional(),
    "delivery_request": DeliveryInputsRequestSchema,
});
export type DeliveryQuoteRequestUpdateRequest = z.infer<typeof DeliveryQuoteRequestUpdateRequestSchema>;

export const CourierSchema = z.object({
    "location": LocationClassSchema.optional(),
    "name": z.string().optional(),
    "phone_number": z.string().optional(),
    "vehicle_type": z.string().optional(),
});
export type Courier = z.infer<typeof CourierSchema>;

export const LocationSchema = z.object({
    "lat": z.number().optional(),
    "lng": z.number().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

export const DeliveryQuoteReferenceSchema = z.object({
    "expires_at": z.coerce.date().optional(),
    "quote_id": z.string(),
});
export type DeliveryQuoteReference = z.infer<typeof DeliveryQuoteReferenceSchema>;

export const BuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
});
export type Buyer = z.infer<typeof BuyerSchema>;

export const RestaurantFulfillmentMethodCreateRequestDeliverySchema = z.object({
    "expires_at": z.coerce.date().optional(),
    "quote_id": z.string().optional(),
    "dropoff": ShippingDestinationRequestSchema.optional(),
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "items_value": PriceSchema.optional(),
    "pickup": RetailLocationRequestSchema.optional(),
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type RestaurantFulfillmentMethodCreateRequestDelivery = z.infer<typeof RestaurantFulfillmentMethodCreateRequestDeliverySchema>;

export const DescriptionClassSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type DescriptionClass = z.infer<typeof DescriptionClassSchema>;

export const MediaSchema = z.object({
    "alt_text": z.string().optional(),
    "height": z.number().optional(),
    "type": MediaTypeSchema,
    "url": z.string(),
    "width": z.number().optional(),
});
export type Media = z.infer<typeof MediaSchema>;

export const ModifierSelectionElementSchema = z.object({
    "id": z.string(),
    "item_id": z.string(),
    "modifier_group_id": z.string(),
    "parent_selection_id": z.string().optional(),
    "parent_selection_path": z.array(z.string()).optional(),
    "quantity": z.number().optional(),
});
export type ModifierSelectionElement = z.infer<typeof ModifierSelectionElementSchema>;

export const PaymentCredentialSchema = z.object({
    "type": z.string(),
    "card_number_type": CardNumberTypeSchema.optional(),
    "cryptogram": z.string().optional(),
    "cvc": z.string().optional(),
    "eci_value": z.string().optional(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "name": z.string().optional(),
    "number": z.string().optional(),
});
export type PaymentCredential = z.infer<typeof PaymentCredentialSchema>;

export const RestaurantFulfillmentAvailableMethodResponseSchema = z.object({
    "description": z.string().optional(),
    "fulfillable_on": z.union([z.null(), z.string()]).optional(),
    "type": RestaurantFulfillmentMethodCreateRequestTypeSchema,
});
export type RestaurantFulfillmentAvailableMethodResponse = z.infer<typeof RestaurantFulfillmentAvailableMethodResponseSchema>;

export const RestaurantTotalResponseSchema = z.object({
    "amount": z.number(),
    "display_text": z.string().optional(),
    "type": RestaurantTotalResponseTypeSchema,
});
export type RestaurantTotalResponse = z.infer<typeof RestaurantTotalResponseSchema>;

export const LinkSchema = z.object({
    "title": z.string().optional(),
    "type": z.string(),
    "url": z.string(),
});
export type Link = z.infer<typeof LinkSchema>;

export const OrderConfirmationSchema = z.object({
    "id": z.string(),
    "permalink_url": z.string(),
});
export type OrderConfirmation = z.infer<typeof OrderConfirmationSchema>;

export const ProductDescriptionSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type ProductDescription = z.infer<typeof ProductDescriptionSchema>;

export const MaxClassSchema = z.object({
    "amount": z.number(),
    "currency": z.string(),
});
export type MaxClass = z.infer<typeof MaxClassSchema>;

export const MediaElementSchema = z.object({
    "alt_text": z.string().optional(),
    "height": z.number().optional(),
    "type": MediaTypeSchema,
    "url": z.string(),
    "width": z.number().optional(),
});
export type MediaElement = z.infer<typeof MediaElementSchema>;

export const ValueElementSchema = z.object({
    "label": z.string(),
});
export type ValueElement = z.infer<typeof ValueElementSchema>;

export const RatingClassSchema = z.object({
    "count": z.number().optional(),
    "scale_max": z.number(),
    "value": z.number(),
});
export type RatingClass = z.infer<typeof RatingClassSchema>;

export const VariantAvailabilitySchema = z.object({
    "available": z.boolean().optional(),
});
export type VariantAvailability = z.infer<typeof VariantAvailabilitySchema>;

export const VariantDescriptionSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type VariantDescription = z.infer<typeof VariantDescriptionSchema>;

export const SelectedOptionElementSchema = z.object({
    "label": z.string(),
    "name": z.string(),
});
export type SelectedOptionElement = z.infer<typeof SelectedOptionElementSchema>;

export const LinkElementSchema = z.object({
    "title": z.string().optional(),
    "type": z.string(),
    "url": z.string(),
});
export type LinkElement = z.infer<typeof LinkElementSchema>;

export const MenuModifierItemSchema = z.object({
    "id": z.string(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "price": PriceSchema,
    "title": z.string(),
});
export type MenuModifierItem = z.infer<typeof MenuModifierItemSchema>;

export const ContextSchema = z.object({
    "country": z.string().optional(),
    "postal_code": z.string().optional(),
    "region": z.string().optional(),
    "intent": z.string().optional(),
});
export type Context = z.infer<typeof ContextSchema>;

export const PriceClassSchema = z.object({
    "max": z.number().optional(),
    "min": z.number().optional(),
});
export type PriceClass = z.infer<typeof PriceClassSchema>;

export const RequestSchema = z.object({
    "cursor": z.string().optional(),
    "limit": z.number().optional(),
});
export type Request = z.infer<typeof RequestSchema>;

export const AdjustmentLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type AdjustmentLineItem = z.infer<typeof AdjustmentLineItemSchema>;

export const PlatformOrderConfigSchema = z.object({
    "webhook_url": z.string(),
});
export type PlatformOrderConfig = z.infer<typeof PlatformOrderConfigSchema>;

export const RestaurantContextSchema = z.object({
    "country": z.string().optional(),
    "postal_code": z.string().optional(),
    "region": z.string().optional(),
    "intent": z.string().optional(),
});
export type RestaurantContext = z.infer<typeof RestaurantContextSchema>;

export const RestaurantFulfillmentMethodCreateRequestSchema = z.object({
    "destinations": z.array(RetailLocationRequestSchema).optional(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": RestaurantFulfillmentMethodCreateRequestTypeSchema,
    "delivery": RestaurantFulfillmentMethodCreateRequestDeliverySchema.optional(),
});
export type RestaurantFulfillmentMethodCreateRequest = z.infer<typeof RestaurantFulfillmentMethodCreateRequestSchema>;

export const RestaurantFulfillmentMethodUpdateRequestSchema = z.object({
    "destinations": z.array(RetailLocationRequestSchema).optional(),
    "id": z.string(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "delivery": RestaurantFulfillmentMethodCreateRequestDeliverySchema.optional(),
});
export type RestaurantFulfillmentMethodUpdateRequest = z.infer<typeof RestaurantFulfillmentMethodUpdateRequestSchema>;

export const AdditionalChargeFlatChargeSchema = z.object({
    "amount": z.number().optional(),
    "currency_code": z.string().optional(),
});
export type AdditionalChargeFlatCharge = z.infer<typeof AdditionalChargeFlatChargeSchema>;

export const AdditionalChargePercentageChargeSchema = z.object({
    "decimal_value": z.number().optional(),
});
export type AdditionalChargePercentageCharge = z.infer<typeof AdditionalChargePercentageChargeSchema>;

export const IntervalElementSchema = z.object({
    "day": z.string(),
    "from_hour": z.number(),
    "from_minute": z.number(),
    "to_hour": z.number(),
    "to_minute": z.number(),
});
export type IntervalElement = z.infer<typeof IntervalElementSchema>;

export const MenuAdditionalChargeFlatChargeSchema = z.object({
    "amount": z.number().optional(),
    "currency_code": z.string().optional(),
});
export type MenuAdditionalChargeFlatCharge = z.infer<typeof MenuAdditionalChargeFlatChargeSchema>;

export const MenuAdditionalChargePercentageChargeSchema = z.object({
    "decimal_value": z.number().optional(),
});
export type MenuAdditionalChargePercentageCharge = z.infer<typeof MenuAdditionalChargePercentageChargeSchema>;

export const MenuHoursIntervalSchema = z.object({
    "day": z.string(),
    "from_hour": z.number(),
    "from_minute": z.number(),
    "to_hour": z.number(),
    "to_minute": z.number(),
});
export type MenuHoursInterval = z.infer<typeof MenuHoursIntervalSchema>;

export const MenuModifierSelectionSchema = z.object({
    "id": z.string(),
    "item_id": z.string(),
    "modifier_group_id": z.string(),
    "parent_selection_id": z.string().optional(),
    "parent_selection_path": z.array(z.string()).optional(),
    "quantity": z.number().optional(),
});
export type MenuModifierSelection = z.infer<typeof MenuModifierSelectionSchema>;

export const RestaurantPickupEventSchema = z.object({
    "created_at": z.coerce.date(),
    "description": z.string().optional(),
    "event_id": z.string(),
    "event_type": EventTypeSchema,
});
export type RestaurantPickupEvent = z.infer<typeof RestaurantPickupEventSchema>;

export const RichTextSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type RichText = z.infer<typeof RichTextSchema>;

export const Ap2CheckoutResponseObjectSchema = z.object({
    "merchant_authorization": z.string(),
});
export type Ap2CheckoutResponseObject = z.infer<typeof Ap2CheckoutResponseObjectSchema>;

export const BuyerClassSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
});
export type BuyerClass = z.infer<typeof BuyerClassSchema>;

export const ItemResponseSchema = z.object({
    "id": z.string(),
    "image_url": z.string().optional(),
    "price": z.number(),
    "title": z.string(),
});
export type ItemResponse = z.infer<typeof ItemResponseSchema>;

export const MessageElementSchema = z.object({
    "code": z.string().optional(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "severity": SeveritySchema.optional(),
    "type": MessageTypeSchema,
});
export type MessageElement = z.infer<typeof MessageElementSchema>;

export const OrderClassSchema = z.object({
    "id": z.string(),
    "permalink_url": z.string(),
});
export type OrderClass = z.infer<typeof OrderClassSchema>;

export const CapabilityResponseElementSchema = z.object({
    "config": z.record(z.string(), z.any()).optional(),
    "extends": z.string().optional(),
    "name": z.string(),
    "schema": z.string().optional(),
    "spec": z.string().optional(),
    "version": z.string(),
});
export type CapabilityResponseElement = z.infer<typeof CapabilityResponseElementSchema>;

export const Ap2CompleteRequestObjectSchema = z.object({
    "checkout_mandate": z.string(),
});
export type Ap2CompleteRequestObject = z.infer<typeof Ap2CompleteRequestObjectSchema>;

export const BuyerWithConsentCreateRequestConsentSchema = z.object({
    "analytics": z.boolean().optional(),
    "marketing": z.boolean().optional(),
    "preferences": z.boolean().optional(),
    "sale_of_data": z.boolean().optional(),
});
export type BuyerWithConsentCreateRequestConsent = z.infer<typeof BuyerWithConsentCreateRequestConsentSchema>;

export const CheckoutWithBuyerConsentCreateRequestBuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentCreateRequestConsentSchema.optional(),
});
export type CheckoutWithBuyerConsentCreateRequestBuyer = z.infer<typeof CheckoutWithBuyerConsentCreateRequestBuyerSchema>;

export const ItemClassSchema = z.object({
    "id": z.string(),
});
export type ItemClass = z.infer<typeof ItemClassSchema>;

export const BuyerWithConsentUpdateRequestConsentSchema = z.object({
    "analytics": z.boolean().optional(),
    "marketing": z.boolean().optional(),
    "preferences": z.boolean().optional(),
    "sale_of_data": z.boolean().optional(),
});
export type BuyerWithConsentUpdateRequestConsent = z.infer<typeof BuyerWithConsentUpdateRequestConsentSchema>;

export const CheckoutWithBuyerConsentUpdateRequestBuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentUpdateRequestConsentSchema.optional(),
});
export type CheckoutWithBuyerConsentUpdateRequestBuyer = z.infer<typeof CheckoutWithBuyerConsentUpdateRequestBuyerSchema>;

export const LineItemItemSchema = z.object({
    "id": z.string(),
});
export type LineItemItem = z.infer<typeof LineItemItemSchema>;

export const ConsentSchema = z.object({
    "analytics": z.boolean().optional(),
    "marketing": z.boolean().optional(),
    "preferences": z.boolean().optional(),
    "sale_of_data": z.boolean().optional(),
});
export type Consent = z.infer<typeof ConsentSchema>;

export const CheckoutWithBuyerConsentResponseBuyerSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": ConsentSchema.optional(),
});
export type CheckoutWithBuyerConsentResponseBuyer = z.infer<typeof CheckoutWithBuyerConsentResponseBuyerSchema>;

export const AllocationElementSchema = z.object({
    "amount": z.number(),
    "path": z.string(),
});
export type AllocationElement = z.infer<typeof AllocationElementSchema>;

export const AllocationClassSchema = z.object({
    "amount": z.number(),
    "path": z.string(),
});
export type AllocationClass = z.infer<typeof AllocationClassSchema>;

export const AllocationSchema = z.object({
    "amount": z.number(),
    "path": z.string(),
});
export type Allocation = z.infer<typeof AllocationSchema>;

export const FulfillmentDestinationRequestElementSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string().optional(),
    "address": BillingAddressClassSchema.optional(),
    "name": z.string().optional(),
});
export type FulfillmentDestinationRequestElement = z.infer<typeof FulfillmentDestinationRequestElementSchema>;

export const GroupElementSchema = z.object({
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type GroupElement = z.infer<typeof GroupElementSchema>;

export const FulfillmentAvailableMethodResponseSchema = z.object({
    "description": z.string().optional(),
    "fulfillable_on": z.union([z.null(), z.string()]).optional(),
    "line_item_ids": z.array(z.string()),
    "type": TypeElementSchema,
});
export type FulfillmentAvailableMethodResponse = z.infer<typeof FulfillmentAvailableMethodResponseSchema>;

export const FulfillmentDestinationResponseSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string(),
    "address": BillingAddressClassSchema.optional(),
    "name": z.string().optional(),
});
export type FulfillmentDestinationResponse = z.infer<typeof FulfillmentDestinationResponseSchema>;

export const FulfillmentOptionResponseSchema = z.object({
    "carrier": z.string().optional(),
    "description": z.string().optional(),
    "earliest_fulfillment_time": z.coerce.date().optional(),
    "id": z.string(),
    "latest_fulfillment_time": z.coerce.date().optional(),
    "title": z.string(),
    "totals": z.array(TotalResponseSchema),
});
export type FulfillmentOptionResponse = z.infer<typeof FulfillmentOptionResponseSchema>;

export const PurpleLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type PurpleLineItem = z.infer<typeof PurpleLineItemSchema>;

export const EventLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type EventLineItem = z.infer<typeof EventLineItemSchema>;

export const ExpectationLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type ExpectationLineItem = z.infer<typeof ExpectationLineItemSchema>;

export const LineItemQuantitySchema = z.object({
    "fulfilled": z.number(),
    "total": z.number(),
});
export type LineItemQuantity = z.infer<typeof LineItemQuantitySchema>;

export const PaymentAccountInfoSchema = z.object({
    "payment_account_reference": z.string().optional(),
});
export type PaymentAccountInfo = z.infer<typeof PaymentAccountInfoSchema>;

export const IdentityClassSchema = z.object({
    "access_token": z.string(),
});
export type IdentityClass = z.infer<typeof IdentityClassSchema>;

export const CardCredentialSchema = z.object({
    "card_number_type": CardNumberTypeSchema,
    "cryptogram": z.string().optional(),
    "cvc": z.string().optional(),
    "eci_value": z.string().optional(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "name": z.string().optional(),
    "number": z.string().optional(),
    "type": CardPaymentInstrumentTypeSchema,
});
export type CardCredential = z.infer<typeof CardCredentialSchema>;

export const CardPaymentInstrumentSchema = z.object({
    "billing_address": BillingAddressClassSchema.optional(),
    "credential": PaymentCredentialSchema.optional(),
    "handler_id": z.string(),
    "id": z.string(),
    "type": CardPaymentInstrumentTypeSchema,
    "brand": z.string(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "last_digits": z.string(),
    "rich_card_art": z.string().optional(),
    "rich_text_description": z.string().optional(),
});
export type CardPaymentInstrument = z.infer<typeof CardPaymentInstrumentSchema>;

export const ExpectationLineItemClassSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type ExpectationLineItemClass = z.infer<typeof ExpectationLineItemClassSchema>;

export const FulfillmentDestinationRequestSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
    "id": z.string().optional(),
    "address": BillingAddressClassSchema.optional(),
    "name": z.string().optional(),
});
export type FulfillmentDestinationRequest = z.infer<typeof FulfillmentDestinationRequestSchema>;

export const FulfillmentEventLineItemSchema = z.object({
    "id": z.string(),
    "quantity": z.number(),
});
export type FulfillmentEventLineItem = z.infer<typeof FulfillmentEventLineItemSchema>;

export const FulfillmentGroupCreateRequestSchema = z.object({
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentGroupCreateRequest = z.infer<typeof FulfillmentGroupCreateRequestSchema>;

export const FulfillmentGroupUpdateRequestSchema = z.object({
    "id": z.string(),
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentGroupUpdateRequest = z.infer<typeof FulfillmentGroupUpdateRequestSchema>;

export const FulfillmentMethodCreateRequestSchema = z.object({
    "destinations": z.array(FulfillmentDestinationRequestElementSchema).optional(),
    "groups": z.array(GroupElementSchema).optional(),
    "line_item_ids": z.array(z.string()).optional(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": TypeElementSchema,
});
export type FulfillmentMethodCreateRequest = z.infer<typeof FulfillmentMethodCreateRequestSchema>;

export const GroupClassSchema = z.object({
    "id": z.string(),
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type GroupClass = z.infer<typeof GroupClassSchema>;

export const ItemCreateRequestSchema = z.object({
    "id": z.string(),
});
export type ItemCreateRequest = z.infer<typeof ItemCreateRequestSchema>;

export const ItemUpdateRequestSchema = z.object({
    "id": z.string(),
});
export type ItemUpdateRequest = z.infer<typeof ItemUpdateRequestSchema>;

export const LineItemCreateRequestSchema = z.object({
    "item": ItemClassSchema,
    "quantity": z.number(),
});
export type LineItemCreateRequest = z.infer<typeof LineItemCreateRequestSchema>;

export const LineItemUpdateRequestSchema = z.object({
    "id": z.string().optional(),
    "item": LineItemItemSchema,
    "parent_id": z.string().optional(),
    "quantity": z.number(),
});
export type LineItemUpdateRequest = z.infer<typeof LineItemUpdateRequestSchema>;

export const AllowsMultiDestinationSchema = z.object({
    "pickup": z.boolean().optional(),
    "shipping": z.boolean().optional(),
});
export type AllowsMultiDestination = z.infer<typeof AllowsMultiDestinationSchema>;

export const MessageErrorSchema = z.object({
    "code": z.string(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "severity": SeveritySchema,
    "type": MessageErrorTypeSchema,
});
export type MessageError = z.infer<typeof MessageErrorSchema>;

export const MessageInfoSchema = z.object({
    "code": z.string().optional(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "type": MessageInfoTypeSchema,
});
export type MessageInfo = z.infer<typeof MessageInfoSchema>;

export const MessageWarningSchema = z.object({
    "code": z.string(),
    "content": z.string(),
    "content_type": ContentTypeSchema.optional(),
    "path": z.string().optional(),
    "type": MessageWarningTypeSchema,
});
export type MessageWarning = z.infer<typeof MessageWarningSchema>;

export const OptionValueSchema = z.object({
    "label": z.string(),
});
export type OptionValue = z.infer<typeof OptionValueSchema>;

export const OrderLineItemQuantitySchema = z.object({
    "fulfilled": z.number(),
    "total": z.number(),
});
export type OrderLineItemQuantity = z.infer<typeof OrderLineItemQuantitySchema>;

export const PaymentIdentitySchema = z.object({
    "access_token": z.string(),
});
export type PaymentIdentity = z.infer<typeof PaymentIdentitySchema>;

export const PaymentInstrumentBaseSchema = z.object({
    "billing_address": BillingAddressClassSchema.optional(),
    "credential": PaymentCredentialSchema.optional(),
    "handler_id": z.string(),
    "id": z.string(),
    "type": z.string(),
});
export type PaymentInstrumentBase = z.infer<typeof PaymentInstrumentBaseSchema>;

export const PlatformFulfillmentConfigSchema = z.object({
    "supports_multi_group": z.boolean().optional(),
});
export type PlatformFulfillmentConfig = z.infer<typeof PlatformFulfillmentConfigSchema>;

export const PostalAddressSchema = z.object({
    "address_country": z.string().optional(),
    "address_locality": z.string().optional(),
    "address_region": z.string().optional(),
    "extended_address": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "postal_code": z.string().optional(),
    "street_address": z.string().optional(),
});
export type PostalAddress = z.infer<typeof PostalAddressSchema>;

export const PriceFilterSchema = z.object({
    "max": z.number().optional(),
    "min": z.number().optional(),
});
export type PriceFilter = z.infer<typeof PriceFilterSchema>;

export const PriceRangeSchema = z.object({
    "max": MaxClassSchema,
    "min": MaxClassSchema,
});
export type PriceRange = z.infer<typeof PriceRangeSchema>;

export const ProductOptionSchema = z.object({
    "name": z.string(),
    "values": z.array(ValueElementSchema),
});
export type ProductOption = z.infer<typeof ProductOptionSchema>;

export const RatingSchema = z.object({
    "count": z.number().optional(),
    "scale_max": z.number(),
    "value": z.number(),
});
export type Rating = z.infer<typeof RatingSchema>;

export const SelectedOptionSchema = z.object({
    "label": z.string(),
    "name": z.string(),
});
export type SelectedOption = z.infer<typeof SelectedOptionSchema>;

export const TokenCredentialCreateRequestSchema = z.object({
    "token": z.string(),
    "type": z.string(),
});
export type TokenCredentialCreateRequest = z.infer<typeof TokenCredentialCreateRequestSchema>;

export const TokenCredentialUpdateRequestSchema = z.object({
    "token": z.string(),
    "type": z.string(),
});
export type TokenCredentialUpdateRequest = z.infer<typeof TokenCredentialUpdateRequestSchema>;

export const TokenCredentialResponseSchema = z.object({
    "type": z.string(),
});
export type TokenCredentialResponse = z.infer<typeof TokenCredentialResponseSchema>;

export const VariantAvailabilityClassSchema = z.object({
    "available": z.boolean().optional(),
});
export type VariantAvailabilityClass = z.infer<typeof VariantAvailabilityClassSchema>;

export const VariantDescriptionClassSchema = z.object({
    "html": z.string().optional(),
    "markdown": z.string().optional(),
    "plain": z.string().optional(),
});
export type VariantDescriptionClass = z.infer<typeof VariantDescriptionClassSchema>;

export const VariantSellerClassSchema = z.object({
    "links": z.array(LinkElementSchema).optional(),
    "name": z.string().optional(),
});
export type VariantSellerClass = z.infer<typeof VariantSellerClassSchema>;

export const PaymentSchema = z.object({
    "handlers": z.array(PaymentHandlerResponseSchema).optional(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const UcpServiceSchema = z.object({
    "a2a": A2ASchema.optional(),
    "embedded": EmbeddedSchema.optional(),
    "mcp": McpSchema.optional(),
    "rest": RestSchema.optional(),
    "spec": z.string(),
    "version": z.string(),
});
export type UcpService = z.infer<typeof UcpServiceSchema>;

export const CourierClassSchema = z.object({
    "location": LocationClassSchema.optional(),
    "name": z.string().optional(),
    "phone_number": z.string().optional(),
    "vehicle_type": z.string().optional(),
});
export type CourierClass = z.infer<typeof CourierClassSchema>;

export const RetailLocationResponseSchema = z.object({
    "address": BillingAddressClassSchema.optional(),
    "id": z.string(),
    "name": z.string(),
});
export type RetailLocationResponse = z.infer<typeof RetailLocationResponseSchema>;

export const UcpOrderResponseSchema = z.object({
    "capabilities": z.array(CapabilityResponseSchema),
    "version": z.string(),
});
export type UcpOrderResponse = z.infer<typeof UcpOrderResponseSchema>;

export const DeliveryUpdateRequestCreateRequestSchema = z.object({
    "dropoff": ShippingDestinationRequestSchema.optional(),
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "items_value": PriceSchema.optional(),
    "pickup": RetailLocationRequestSchema.optional(),
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type DeliveryUpdateRequestCreateRequest = z.infer<typeof DeliveryUpdateRequestCreateRequestSchema>;

export const DeliveryQuoteRequestCreateRequestSchema = z.object({
    "context": PurpleContextSchema.optional(),
    "delivery_request": DeliveryInputsRequestSchema,
});
export type DeliveryQuoteRequestCreateRequest = z.infer<typeof DeliveryQuoteRequestCreateRequestSchema>;

export const DeliveryQuoteSchema = z.object({
    "expires_at": z.coerce.date().optional(),
    "quote_id": z.string(),
    "totals": z.array(TotalResponseSchema).optional(),
});
export type DeliveryQuote = z.infer<typeof DeliveryQuoteSchema>;

export const DeliveryQuoteResponseUpdateRequestSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "quote": DeliveryQuoteSchema,
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryQuoteResponseUpdateRequest = z.infer<typeof DeliveryQuoteResponseUpdateRequestSchema>;

export const DeliveryUpdateRequestResponseSchema = z.object({
    "dropoff": ShippingDestinationResponseSchema.optional(),
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "items_value": PriceSchema.optional(),
    "pickup": RetailLocationResponseSchema.optional(),
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type DeliveryUpdateRequestResponse = z.infer<typeof DeliveryUpdateRequestResponseSchema>;

export const DeliveryQuoteResponseResponseSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "quote": DeliveryQuoteSchema,
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryQuoteResponseResponse = z.infer<typeof DeliveryQuoteResponseResponseSchema>;

export const RestaurantFulfillmentMethodCreateRequestElementSchema = z.object({
    "destinations": z.array(RetailLocationRequestSchema).optional(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": RestaurantFulfillmentMethodCreateRequestTypeSchema,
    "delivery": RestaurantFulfillmentMethodCreateRequestDeliverySchema.optional(),
});
export type RestaurantFulfillmentMethodCreateRequestElement = z.infer<typeof RestaurantFulfillmentMethodCreateRequestElementSchema>;

export const PaymentInstrumentSchema = z.object({
    "billing_address": BillingAddressClassSchema.optional(),
    "credential": PaymentCredentialSchema.optional(),
    "handler_id": z.string(),
    "id": z.string(),
    "type": CardPaymentInstrumentTypeSchema,
    "brand": z.string(),
    "expiry_month": z.number().optional(),
    "expiry_year": z.number().optional(),
    "last_digits": z.string(),
    "rich_card_art": z.string().optional(),
    "rich_text_description": z.string().optional(),
});
export type PaymentInstrument = z.infer<typeof PaymentInstrumentSchema>;

export const PaymentUpdateRequestSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentUpdateRequest = z.infer<typeof PaymentUpdateRequestSchema>;

export const RestaurantFulfillmentMethodResponseDeliverySchema = z.object({
    "expires_at": z.coerce.date().optional(),
    "quote_id": z.string().optional(),
    "dropoff": ShippingDestinationResponseSchema.optional(),
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "items_value": PriceSchema.optional(),
    "pickup": RetailLocationResponseSchema.optional(),
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type RestaurantFulfillmentMethodResponseDelivery = z.infer<typeof RestaurantFulfillmentMethodResponseDeliverySchema>;

export const PaymentResponseSchema = z.object({
    "handlers": z.array(PaymentHandlerResponseSchema),
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;

export const ListPriceClassSchema = z.object({
    "max": MaxClassSchema,
    "min": MaxClassSchema,
});
export type ListPriceClass = z.infer<typeof ListPriceClassSchema>;

export const OptionElementSchema = z.object({
    "name": z.string(),
    "values": z.array(ValueElementSchema),
});
export type OptionElement = z.infer<typeof OptionElementSchema>;

export const VariantSellerSchema = z.object({
    "links": z.array(LinkElementSchema).optional(),
    "name": z.string().optional(),
});
export type VariantSeller = z.infer<typeof VariantSellerSchema>;

export const GetModifierItemResponseSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "modifier_item": MenuModifierItemSchema,
    "ucp": UcpOrderResponseSchema,
});
export type GetModifierItemResponse = z.infer<typeof GetModifierItemResponseSchema>;

export const SearchFiltersSchema = z.object({
    "category": z.string().optional(),
    "price": PriceClassSchema.optional(),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export const AdjustmentSchema = z.object({
    "amount": z.number().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(AdjustmentLineItemSchema).optional(),
    "occurred_at": z.coerce.date(),
    "status": AdjustmentStatusSchema,
    "type": z.string(),
});
export type Adjustment = z.infer<typeof AdjustmentSchema>;

export const RestaurantFulfillmentRequestSchema = z.object({
    "methods": z.array(RestaurantFulfillmentMethodCreateRequestElementSchema).optional(),
});
export type RestaurantFulfillmentRequest = z.infer<typeof RestaurantFulfillmentRequestSchema>;

export const AdditionalChargeElementSchema = z.object({
    "charge_type": z.string().optional(),
    "flat_charge": AdditionalChargeFlatChargeSchema.optional(),
    "percentage_charge": AdditionalChargePercentageChargeSchema.optional(),
});
export type AdditionalChargeElement = z.infer<typeof AdditionalChargeElementSchema>;

export const HoursSchema = z.object({
    "intervals": z.array(IntervalElementSchema).optional(),
});
export type Hours = z.infer<typeof HoursSchema>;

export const MenuAdditionalChargeSchema = z.object({
    "charge_type": z.string().optional(),
    "flat_charge": MenuAdditionalChargeFlatChargeSchema.optional(),
    "percentage_charge": MenuAdditionalChargePercentageChargeSchema.optional(),
});
export type MenuAdditionalCharge = z.infer<typeof MenuAdditionalChargeSchema>;

export const LineItemResponseSchema = z.object({
    "id": z.string(),
    "item": ItemResponseSchema,
    "parent_id": z.string().optional(),
    "quantity": z.number(),
    "totals": z.array(TotalResponseSchema),
});
export type LineItemResponse = z.infer<typeof LineItemResponseSchema>;

export const UcpClassSchema = z.object({
    "capabilities": z.array(CapabilityResponseElementSchema),
    "version": z.string(),
});
export type UcpClass = z.infer<typeof UcpClassSchema>;

export const CompleteCheckoutRequestWithAp2Schema = z.object({
    "ap2": Ap2CompleteRequestObjectSchema.optional(),
});
export type CompleteCheckoutRequestWithAp2 = z.infer<typeof CompleteCheckoutRequestWithAp2Schema>;

export const BuyerWithConsentCreateRequestSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentCreateRequestConsentSchema.optional(),
});
export type BuyerWithConsentCreateRequest = z.infer<typeof BuyerWithConsentCreateRequestSchema>;

export const CheckoutWithBuyerConsentCreateRequestLineItemSchema = z.object({
    "item": ItemClassSchema,
    "quantity": z.number(),
});
export type CheckoutWithBuyerConsentCreateRequestLineItem = z.infer<typeof CheckoutWithBuyerConsentCreateRequestLineItemSchema>;

export const PaymentClassSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentClass = z.infer<typeof PaymentClassSchema>;

export const BuyerWithConsentUpdateRequestSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": BuyerWithConsentUpdateRequestConsentSchema.optional(),
});
export type BuyerWithConsentUpdateRequest = z.infer<typeof BuyerWithConsentUpdateRequestSchema>;

export const CheckoutWithBuyerConsentUpdateRequestLineItemSchema = z.object({
    "id": z.string().optional(),
    "item": LineItemItemSchema,
    "parent_id": z.string().optional(),
    "quantity": z.number(),
});
export type CheckoutWithBuyerConsentUpdateRequestLineItem = z.infer<typeof CheckoutWithBuyerConsentUpdateRequestLineItemSchema>;

export const CheckoutWithBuyerConsentUpdateRequestPaymentSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type CheckoutWithBuyerConsentUpdateRequestPayment = z.infer<typeof CheckoutWithBuyerConsentUpdateRequestPaymentSchema>;

export const BuyerWithConsentResponseSchema = z.object({
    "email": z.string().optional(),
    "first_name": z.string().optional(),
    "full_name": z.string().optional(),
    "last_name": z.string().optional(),
    "phone_number": z.string().optional(),
    "consent": ConsentSchema.optional(),
});
export type BuyerWithConsentResponse = z.infer<typeof BuyerWithConsentResponseSchema>;

export const CheckoutWithBuyerConsentResponseSchema = z.object({
    "buyer": CheckoutWithBuyerConsentResponseBuyerSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutRestaurantExtensionResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
});
export type CheckoutWithBuyerConsentResponse = z.infer<typeof CheckoutWithBuyerConsentResponseSchema>;

export const CheckoutCreateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentCreateRequestLineItemSchema),
    "payment": PaymentClassSchema,
});
export type CheckoutCreateRequest = z.infer<typeof CheckoutCreateRequestSchema>;

export const CheckoutUpdateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentUpdateRequestLineItemSchema),
    "payment": CheckoutWithBuyerConsentUpdateRequestPaymentSchema,
});
export type CheckoutUpdateRequest = z.infer<typeof CheckoutUpdateRequestSchema>;

export const CheckoutResponseSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutRestaurantExtensionResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
});
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

export const AppliedElementSchema = z.object({
    "allocations": z.array(AllocationElementSchema).optional(),
    "amount": z.number(),
    "automatic": z.boolean().optional(),
    "code": z.string().optional(),
    "method": MethodSchema.optional(),
    "priority": z.number().optional(),
    "title": z.string(),
});
export type AppliedElement = z.infer<typeof AppliedElementSchema>;

export const AppliedClassSchema = z.object({
    "allocations": z.array(AllocationClassSchema).optional(),
    "amount": z.number(),
    "automatic": z.boolean().optional(),
    "code": z.string().optional(),
    "method": MethodSchema.optional(),
    "priority": z.number().optional(),
    "title": z.string(),
});
export type AppliedClass = z.infer<typeof AppliedClassSchema>;

export const AppliedDiscountSchema = z.object({
    "allocations": z.array(AllocationSchema).optional(),
    "amount": z.number(),
    "automatic": z.boolean().optional(),
    "code": z.string().optional(),
    "method": MethodSchema.optional(),
    "priority": z.number().optional(),
    "title": z.string(),
});
export type AppliedDiscount = z.infer<typeof AppliedDiscountSchema>;

export const MethodElementSchema = z.object({
    "destinations": z.array(FulfillmentDestinationRequestElementSchema).optional(),
    "groups": z.array(GroupElementSchema).optional(),
    "line_item_ids": z.array(z.string()).optional(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": TypeElementSchema,
});
export type MethodElement = z.infer<typeof MethodElementSchema>;

export const FulfillmentGroupResponseSchema = z.object({
    "id": z.string(),
    "line_item_ids": z.array(z.string()),
    "options": z.array(FulfillmentOptionResponseSchema).optional(),
    "selected_option_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentGroupResponse = z.infer<typeof FulfillmentGroupResponseSchema>;

export const AdjustmentElementSchema = z.object({
    "amount": z.number().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(PurpleLineItemSchema).optional(),
    "occurred_at": z.coerce.date(),
    "status": AdjustmentStatusSchema,
    "type": z.string(),
});
export type AdjustmentElement = z.infer<typeof AdjustmentElementSchema>;

export const EventElementSchema = z.object({
    "carrier": z.string().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(EventLineItemSchema),
    "occurred_at": z.coerce.date(),
    "tracking_number": z.string().optional(),
    "tracking_url": z.string().optional(),
    "type": z.string(),
});
export type EventElement = z.infer<typeof EventElementSchema>;

export const ExpectationElementSchema = z.object({
    "description": z.string().optional(),
    "destination": BillingAddressClassSchema,
    "fulfillable_on": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(ExpectationLineItemSchema),
    "method_type": MethodTypeSchema,
});
export type ExpectationElement = z.infer<typeof ExpectationElementSchema>;

export const OrderLineItemClassSchema = z.object({
    "id": z.string(),
    "item": ItemResponseSchema,
    "parent_id": z.string().optional(),
    "quantity": LineItemQuantitySchema,
    "status": LineItemStatusSchema,
    "totals": z.array(TotalResponseSchema),
});
export type OrderLineItemClass = z.infer<typeof OrderLineItemClassSchema>;

export const PaymentDataSchema = z.object({
    "payment_data": PaymentInstrumentSchema,
});
export type PaymentData = z.infer<typeof PaymentDataSchema>;

export const BindingSchema = z.object({
    "checkout_id": z.string(),
    "identity": IdentityClassSchema.optional(),
});
export type Binding = z.infer<typeof BindingSchema>;

export const ExpectationSchema = z.object({
    "description": z.string().optional(),
    "destination": BillingAddressClassSchema,
    "fulfillable_on": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(ExpectationLineItemClassSchema),
    "method_type": MethodTypeSchema,
});
export type Expectation = z.infer<typeof ExpectationSchema>;

export const FulfillmentEventSchema = z.object({
    "carrier": z.string().optional(),
    "description": z.string().optional(),
    "id": z.string(),
    "line_items": z.array(FulfillmentEventLineItemSchema),
    "occurred_at": z.coerce.date(),
    "tracking_number": z.string().optional(),
    "tracking_url": z.string().optional(),
    "type": z.string(),
});
export type FulfillmentEvent = z.infer<typeof FulfillmentEventSchema>;

export const FulfillmentMethodUpdateRequestSchema = z.object({
    "destinations": z.array(FulfillmentDestinationRequestElementSchema).optional(),
    "groups": z.array(GroupClassSchema).optional(),
    "id": z.string(),
    "line_item_ids": z.array(z.string()),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
});
export type FulfillmentMethodUpdateRequest = z.infer<typeof FulfillmentMethodUpdateRequestSchema>;

export const MerchantFulfillmentConfigSchema = z.object({
    "allows_method_combinations": z.array(z.array(TypeElementSchema)).optional(),
    "allows_multi_destination": AllowsMultiDestinationSchema.optional(),
});
export type MerchantFulfillmentConfig = z.infer<typeof MerchantFulfillmentConfigSchema>;

export const OrderLineItemSchema = z.object({
    "id": z.string(),
    "item": ItemResponseSchema,
    "parent_id": z.string().optional(),
    "quantity": OrderLineItemQuantitySchema,
    "status": LineItemStatusSchema,
    "totals": z.array(TotalResponseSchema),
});
export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;

export const VariantSchema = z.object({
    "availability": VariantAvailabilityClassSchema.optional(),
    "barcode": z.string().optional(),
    "category": z.string().optional(),
    "description": VariantDescriptionClassSchema,
    "handle": z.string().optional(),
    "id": z.string(),
    "list_price": MaxClassSchema.optional(),
    "media": z.array(MediaElementSchema).optional(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "price": MaxClassSchema,
    "rating": RatingClassSchema.optional(),
    "selected_options": z.array(SelectedOptionElementSchema).optional(),
    "seller": VariantSellerClassSchema.optional(),
    "sku": z.string().optional(),
    "tags": z.array(z.string()).optional(),
    "title": z.string(),
    "url": z.string().optional(),
});
export type Variant = z.infer<typeof VariantSchema>;

export const UcpDiscoveryMetadataSchema = z.object({
    "capabilities": z.array(CapabilityDiscoverySchema),
    "services": z.record(z.string(), UcpServiceSchema),
    "version": z.string(),
});
export type UcpDiscoveryMetadata = z.infer<typeof UcpDiscoveryMetadataSchema>;

export const DeliveryInputsResponseSchema = z.object({
    "dropoff": ShippingDestinationResponseSchema,
    "dropoff_deadline_dt": z.coerce.date().optional(),
    "dropoff_ready_dt": z.coerce.date().optional(),
    "external_id": z.string().optional(),
    "external_store_id": z.string().optional(),
    "items_value": PriceSchema,
    "pickup": RetailLocationResponseSchema,
    "pickup_deadline_dt": z.coerce.date().optional(),
    "pickup_ready_dt": z.coerce.date().optional(),
});
export type DeliveryInputsResponse = z.infer<typeof DeliveryInputsResponseSchema>;

export const DeliveryQuoteResponseCreateRequestSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "quote": DeliveryQuoteSchema,
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryQuoteResponseCreateRequest = z.infer<typeof DeliveryQuoteResponseCreateRequestSchema>;

export const DeliveryQuoteRequestResponseSchema = z.object({
    "context": PurpleContextSchema.optional(),
    "delivery_request": DeliveryInputsResponseSchema,
});
export type DeliveryQuoteRequestResponse = z.infer<typeof DeliveryQuoteRequestResponseSchema>;

export const DeliveryEventDeliverySchema = z.object({
    "courier": CourierClassSchema.optional(),
    "courier_imminent": z.boolean().optional(),
    "created_at": z.coerce.date().optional(),
    "delivery_request": DeliveryInputsResponseSchema.optional(),
    "id": z.string(),
    "quote_id": z.string().optional(),
    "status": DeliveryStatusSchema,
    "tracking_url": z.string().optional(),
    "updated_at": z.coerce.date().optional(),
});
export type DeliveryEventDelivery = z.infer<typeof DeliveryEventDeliverySchema>;

export const FulfillmentClassSchema = z.object({
    "methods": z.array(RestaurantFulfillmentMethodCreateRequestElementSchema).optional(),
});
export type FulfillmentClass = z.infer<typeof FulfillmentClassSchema>;

export const PaymentCreateRequestSchema = z.object({
    "instruments": z.array(PaymentInstrumentSchema).optional(),
    "selected_instrument_id": z.string().optional(),
});
export type PaymentCreateRequest = z.infer<typeof PaymentCreateRequestSchema>;

export const RestaurantFulfillmentMethodResponseSchema = z.object({
    "destinations": z.array(RetailLocationResponseSchema).optional(),
    "id": z.string(),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": RestaurantFulfillmentMethodCreateRequestTypeSchema,
    "delivery": RestaurantFulfillmentMethodResponseDeliverySchema.optional(),
});
export type RestaurantFulfillmentMethodResponse = z.infer<typeof RestaurantFulfillmentMethodResponseSchema>;

export const VariantElementSchema = z.object({
    "availability": VariantAvailabilitySchema.optional(),
    "barcode": z.string().optional(),
    "category": z.string().optional(),
    "description": VariantDescriptionSchema,
    "handle": z.string().optional(),
    "id": z.string(),
    "list_price": MaxClassSchema.optional(),
    "media": z.array(MediaElementSchema).optional(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "price": MaxClassSchema,
    "rating": RatingClassSchema.optional(),
    "selected_options": z.array(SelectedOptionElementSchema).optional(),
    "seller": VariantSellerSchema.optional(),
    "sku": z.string().optional(),
    "tags": z.array(z.string()).optional(),
    "title": z.string(),
    "url": z.string().optional(),
});
export type VariantElement = z.infer<typeof VariantElementSchema>;

export const SearchRequestSchema = z.object({
    "context": ContextSchema.optional(),
    "filters": SearchFiltersSchema.optional(),
    "pagination": RequestSchema.optional(),
    "query": z.string(),
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export const RestaurantFulfillmentEventSchema = z.object({
    "created_at": z.coerce.date(),
    "description": z.string().optional(),
    "event_id": z.string(),
    "event_type": RestaurantFulfillmentEventEventTypeSchema,
    "delivery": DeliveryEventDeliverySchema.optional(),
});
export type RestaurantFulfillmentEvent = z.infer<typeof RestaurantFulfillmentEventSchema>;

export const MenuSchema = z.object({
    "additional_charges": z.array(AdditionalChargeElementSchema).optional(),
    "category_ids": z.array(z.string()),
    "description": z.string().optional(),
    "fulfillment_modes": z.array(z.string()).optional(),
    "hours": HoursSchema.optional(),
    "id": z.string(),
    "name": z.string(),
});
export type Menu = z.infer<typeof MenuSchema>;

export const CheckoutWithAp2MandateSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutRestaurantExtensionResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
    "ap2": Ap2CheckoutResponseObjectSchema.optional(),
});
export type CheckoutWithAp2Mandate = z.infer<typeof CheckoutWithAp2MandateSchema>;

export const CheckoutWithBuyerConsentCreateRequestSchema = z.object({
    "buyer": CheckoutWithBuyerConsentCreateRequestBuyerSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentCreateRequestLineItemSchema),
    "payment": PaymentClassSchema,
});
export type CheckoutWithBuyerConsentCreateRequest = z.infer<typeof CheckoutWithBuyerConsentCreateRequestSchema>;

export const CheckoutWithBuyerConsentUpdateRequestSchema = z.object({
    "buyer": CheckoutWithBuyerConsentUpdateRequestBuyerSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentUpdateRequestLineItemSchema),
    "payment": CheckoutWithBuyerConsentUpdateRequestPaymentSchema,
});
export type CheckoutWithBuyerConsentUpdateRequest = z.infer<typeof CheckoutWithBuyerConsentUpdateRequestSchema>;

export const CheckoutWithDiscountCreateRequestDiscountsSchema = z.object({
    "applied": z.array(AppliedElementSchema).optional(),
    "codes": z.array(z.string()).optional(),
});
export type CheckoutWithDiscountCreateRequestDiscounts = z.infer<typeof CheckoutWithDiscountCreateRequestDiscountsSchema>;

export const CheckoutWithDiscountUpdateRequestDiscountsSchema = z.object({
    "applied": z.array(AppliedClassSchema).optional(),
    "codes": z.array(z.string()).optional(),
});
export type CheckoutWithDiscountUpdateRequestDiscounts = z.infer<typeof CheckoutWithDiscountUpdateRequestDiscountsSchema>;

export const DiscountsObjectSchema = z.object({
    "applied": z.array(AppliedDiscountSchema).optional(),
    "codes": z.array(z.string()).optional(),
});
export type DiscountsObject = z.infer<typeof DiscountsObjectSchema>;

export const FulfillmentRequestSchema = z.object({
    "methods": z.array(MethodElementSchema).optional(),
});
export type FulfillmentRequest = z.infer<typeof FulfillmentRequestSchema>;

export const CheckoutWithFulfillmentUpdateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentUpdateRequestLineItemSchema),
    "payment": CheckoutWithBuyerConsentUpdateRequestPaymentSchema,
    "fulfillment": FulfillmentRequestSchema.optional(),
});
export type CheckoutWithFulfillmentUpdateRequest = z.infer<typeof CheckoutWithFulfillmentUpdateRequestSchema>;

export const FulfillmentMethodResponseSchema = z.object({
    "destinations": z.array(FulfillmentDestinationResponseSchema).optional(),
    "groups": z.array(FulfillmentGroupResponseSchema).optional(),
    "id": z.string(),
    "line_item_ids": z.array(z.string()),
    "selected_destination_id": z.union([z.null(), z.string()]).optional(),
    "type": TypeElementSchema,
});
export type FulfillmentMethodResponse = z.infer<typeof FulfillmentMethodResponseSchema>;

export const OrderFulfillmentSchema = z.object({
    "events": z.array(EventElementSchema).optional(),
    "expectations": z.array(ExpectationElementSchema).optional(),
});
export type OrderFulfillment = z.infer<typeof OrderFulfillmentSchema>;

export const UcpDiscoveryProfileSchema = z.object({
    "payment": PaymentSchema.optional(),
    "signing_keys": z.array(SigningKeySchema).optional(),
    "ucp": UcpDiscoveryMetadataSchema,
});
export type UcpDiscoveryProfile = z.infer<typeof UcpDiscoveryProfileSchema>;

export const DeliverySchema = z.object({
    "courier": CourierClassSchema.optional(),
    "courier_imminent": z.boolean().optional(),
    "created_at": z.coerce.date().optional(),
    "delivery_request": DeliveryInputsResponseSchema.optional(),
    "id": z.string(),
    "quote_id": z.string().optional(),
    "status": DeliveryStatusSchema,
    "tracking_url": z.string().optional(),
    "updated_at": z.coerce.date().optional(),
});
export type Delivery = z.infer<typeof DeliverySchema>;

export const DeliveryResponseCreateRequestSchema = z.object({
    "delivery": DeliverySchema,
    "messages": z.array(MessageSchema).optional(),
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryResponseCreateRequest = z.infer<typeof DeliveryResponseCreateRequestSchema>;

export const DeliveryListResponseUpdateRequestSchema = z.object({
    "data": z.array(DeliverySchema),
    "messages": z.array(MessageSchema).optional(),
    "pagination": ResponseSchema.optional(),
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryListResponseUpdateRequest = z.infer<typeof DeliveryListResponseUpdateRequestSchema>;

export const DeliveryResponseUpdateRequestSchema = z.object({
    "delivery": DeliverySchema,
    "messages": z.array(MessageSchema).optional(),
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryResponseUpdateRequest = z.infer<typeof DeliveryResponseUpdateRequestSchema>;

export const DeliveryListResponseResponseSchema = z.object({
    "data": z.array(DeliverySchema),
    "messages": z.array(MessageSchema).optional(),
    "pagination": ResponseSchema.optional(),
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryListResponseResponse = z.infer<typeof DeliveryListResponseResponseSchema>;

export const DeliveryResponseResponseSchema = z.object({
    "delivery": DeliverySchema,
    "messages": z.array(MessageSchema).optional(),
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryResponseResponse = z.infer<typeof DeliveryResponseResponseSchema>;

export const DeliveryEventSchema = z.object({
    "created_at": z.coerce.date(),
    "delivery": DeliveryEventDeliverySchema,
    "event_id": z.string(),
    "event_type": DeliveryStatusSchema,
});
export type DeliveryEvent = z.infer<typeof DeliveryEventSchema>;

export const RestaurantFulfillmentResponseSchema = z.object({
    "available_methods": z.array(RestaurantFulfillmentAvailableMethodResponseSchema).optional(),
    "methods": z.array(RestaurantFulfillmentMethodResponseSchema).optional(),
});
export type RestaurantFulfillmentResponse = z.infer<typeof RestaurantFulfillmentResponseSchema>;

export const ProductSchema = z.object({
    "category": z.string().optional(),
    "description": ProductDescriptionSchema,
    "handle": z.string().optional(),
    "id": z.string(),
    "list_price": ListPriceClassSchema.optional(),
    "media": z.array(MediaElementSchema).optional(),
    "metadata": z.record(z.string(), z.any()).optional(),
    "options": z.array(OptionElementSchema).optional(),
    "price": ListPriceClassSchema,
    "rating": RatingClassSchema.optional(),
    "tags": z.array(z.string()).optional(),
    "title": z.string(),
    "url": z.string().optional(),
    "variants": z.array(VariantElementSchema),
});
export type Product = z.infer<typeof ProductSchema>;

export const SearchResponseSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "pagination": ResponseSchema.optional(),
    "products": z.array(ProductSchema),
    "ucp": UcpOrderResponseSchema,
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const RestaurantOrderFulfillmentSchema = z.object({
    "events": z.array(RestaurantFulfillmentEventSchema).optional(),
    "status": RestaurantFulfillmentEventEventTypeSchema,
    "type": RestaurantFulfillmentMethodCreateRequestTypeSchema,
});
export type RestaurantOrderFulfillment = z.infer<typeof RestaurantOrderFulfillmentSchema>;

export const CheckoutWithDiscountCreateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentCreateRequestLineItemSchema),
    "payment": PaymentClassSchema,
    "discounts": CheckoutWithDiscountCreateRequestDiscountsSchema.optional(),
});
export type CheckoutWithDiscountCreateRequest = z.infer<typeof CheckoutWithDiscountCreateRequestSchema>;

export const CheckoutWithDiscountUpdateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "id": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentUpdateRequestLineItemSchema),
    "payment": CheckoutWithBuyerConsentUpdateRequestPaymentSchema,
    "discounts": CheckoutWithDiscountUpdateRequestDiscountsSchema.optional(),
});
export type CheckoutWithDiscountUpdateRequest = z.infer<typeof CheckoutWithDiscountUpdateRequestSchema>;

export const CheckoutWithDiscountResponseSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutRestaurantExtensionResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
    "discounts": DiscountsObjectSchema.optional(),
});
export type CheckoutWithDiscountResponse = z.infer<typeof CheckoutWithDiscountResponseSchema>;

export const CheckoutWithFulfillmentCreateRequestSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "currency": z.string(),
    "line_items": z.array(CheckoutWithBuyerConsentCreateRequestLineItemSchema),
    "payment": PaymentClassSchema,
    "fulfillment": FulfillmentRequestSchema.optional(),
});
export type CheckoutWithFulfillmentCreateRequest = z.infer<typeof CheckoutWithFulfillmentCreateRequestSchema>;

export const FulfillmentResponseSchema = z.object({
    "available_methods": z.array(FulfillmentAvailableMethodResponseSchema).optional(),
    "methods": z.array(FulfillmentMethodResponseSchema).optional(),
});
export type FulfillmentResponse = z.infer<typeof FulfillmentResponseSchema>;

export const OrderSchema = z.object({
    "adjustments": z.array(AdjustmentElementSchema).optional(),
    "checkout_id": z.string(),
    "fulfillment": OrderFulfillmentSchema,
    "id": z.string(),
    "line_items": z.array(OrderLineItemClassSchema),
    "permalink_url": z.string(),
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
});
export type Order = z.infer<typeof OrderSchema>;

export const DeliveryListResponseCreateRequestSchema = z.object({
    "data": z.array(DeliverySchema),
    "messages": z.array(MessageSchema).optional(),
    "pagination": ResponseSchema.optional(),
    "ucp": UcpOrderResponseSchema,
});
export type DeliveryListResponseCreateRequest = z.infer<typeof DeliveryListResponseCreateRequestSchema>;

export const GetItemResponseSchema = z.object({
    "messages": z.array(MessageSchema).optional(),
    "product": ProductSchema.optional(),
    "ucp": UcpOrderResponseSchema,
});
export type GetItemResponse = z.infer<typeof GetItemResponseSchema>;

export const CheckoutWithFulfillmentResponseSchema = z.object({
    "buyer": BuyerClassSchema.optional(),
    "continue_url": z.string().optional(),
    "currency": z.string(),
    "expires_at": z.coerce.date().optional(),
    "id": z.string(),
    "line_items": z.array(LineItemResponseSchema),
    "links": z.array(LinkElementSchema),
    "messages": z.array(MessageElementSchema).optional(),
    "order": OrderClassSchema.optional(),
    "payment": PaymentResponseSchema,
    "status": CheckoutRestaurantExtensionResponseStatusSchema,
    "totals": z.array(TotalResponseSchema),
    "ucp": UcpClassSchema,
    "fulfillment": FulfillmentResponseSchema.optional(),
});
export type CheckoutWithFulfillmentResponse = z.infer<typeof CheckoutWithFulfillmentResponseSchema>;
