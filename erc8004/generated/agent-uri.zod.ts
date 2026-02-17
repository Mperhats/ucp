import * as z from "zod";


export const TypeSchema = z.enum([
    "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
]);
export type Type = z.infer<typeof TypeSchema>;

export const EndpointElementSchema = z.object({
    "capabilities": z.array(z.string()).optional(),
    "domains": z.array(z.string()).optional(),
    "endpoint": z.string(),
    "name": z.string(),
    "skills": z.array(z.string()).optional(),
    "version": z.string().optional(),
});
export type EndpointElement = z.infer<typeof EndpointElementSchema>;

export const RegistrationElementSchema = z.object({
    "agentId": z.number(),
    "agentRegistry": z.string(),
});
export type RegistrationElement = z.infer<typeof RegistrationElementSchema>;

export const AgentUriZodSchema = z.object({
    "active": z.boolean(),
    "description": z.string(),
    "endpoints": z.array(EndpointElementSchema),
    "image": z.string(),
    "name": z.string(),
    "registrations": z.array(RegistrationElementSchema),
    "supportedTrust": z.array(z.string()).optional(),
    "type": TypeSchema,
    "x402Support": z.boolean().optional(),
});
export type AgentUriZod = z.infer<typeof AgentUriZodSchema>;
