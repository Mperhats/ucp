import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";

export function buildAgentUri(args: {
  name: string;
  description: string;
  imageUrl: string;
  endpoints: AgentUriZod["endpoints"];
}): AgentUriZod {
  return AgentUriZodSchema.parse({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: args.name,
    description: args.description,
    image: args.imageUrl,
    endpoints: args.endpoints,
    active: true,
    registrations: [],
  });
}
