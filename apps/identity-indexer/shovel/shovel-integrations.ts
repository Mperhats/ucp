import type { Abi, ExtractAbiEventNames } from "abitype";
import { contracts } from "@ucp/contracts";
import type {
  ContractIntegrationConfig,
  EventInputMapping,
} from "./shovel-types.js";

function defineEventIntegration<
  TContractName extends keyof typeof contracts,
  TAbi extends Abi = (typeof contracts)[TContractName]["abi"],
  TEventName extends ExtractAbiEventNames<TAbi> = ExtractAbiEventNames<TAbi>,
>(args: {
  contractName: TContractName;
  shovelName: string;
  tableName: string;
  addressColumn: string;
  eventName: TEventName;
  inputs: EventInputMapping<TAbi, TEventName>;
}): ContractIntegrationConfig<TContractName, TAbi, TEventName> {
  return {
    contractName: args.contractName,
    abi: contracts[args.contractName].abi as unknown as TAbi,
    shovelName: args.shovelName,
    table: {
      name: args.tableName,
      addressColumn: args.addressColumn,
    },
    event: {
      name: args.eventName,
      inputs: args.inputs,
    },
  };
}

export const shovelIntegrations = [
  defineEventIntegration({
    contractName: "IdentityRegistry",
    shovelName: "erc8004_identity_registry",
    tableName: "erc8004_identity_events",
    addressColumn: "registry",
    eventName: "Registered",
    inputs: {
      agentId: { column: "agent_id", type: "numeric" },
      agentURI: { column: "agent_uri", type: "text" },
      owner: { column: "owner", type: "bytea" },
    },
  }),
  defineEventIntegration({
    contractName: "IdentityRegistry",
    shovelName: "erc8004_identity_uri_updated",
    tableName: "erc8004_identity_uri_events",
    addressColumn: "registry",
    eventName: "URIUpdated",
    inputs: {
      agentId: { column: "agent_id", type: "numeric" },
      newURI: { column: "new_uri", type: "text" },
      updatedBy: { column: "updated_by", type: "bytea" },
    },
  }),
  defineEventIntegration({
    contractName: "IdentityRegistry",
    shovelName: "erc8004_identity_wallet_set",
    tableName: "erc8004_identity_wallet_events",
    addressColumn: "registry",
    eventName: "AgentWalletSet",
    inputs: {
      agentId: { column: "agent_id", type: "numeric" },
      newWallet: { column: "new_wallet", type: "bytea" },
      setBy: { column: "set_by", type: "bytea" },
    },
  }),
  defineEventIntegration({
    contractName: "ReputationRegistry",
    shovelName: "erc8004_reputation_feedback_revoked",
    tableName: "erc8004_reputation_revoked_events",
    addressColumn: "registry",
    eventName: "FeedbackRevoked",
    inputs: {
      agentId: { column: "agent_id", type: "numeric" },
      clientAddress: { column: "client_address", type: "bytea" },
      feedbackIndex: { column: "feedback_index", type: "numeric" },
    },
  }),
  defineEventIntegration({
    contractName: "ReputationRegistry",
    shovelName: "erc8004_reputation_response_appended",
    tableName: "erc8004_reputation_response_events",
    addressColumn: "registry",
    eventName: "ResponseAppended",
    inputs: {
      agentId: { column: "agent_id", type: "numeric" },
      clientAddress: { column: "client_address", type: "bytea" },
      feedbackIndex: { column: "feedback_index", type: "numeric" },
      responder: { column: "responder", type: "bytea" },
      responseURI: { column: "response_uri", type: "text" },
    },
  }),
  defineEventIntegration({
    contractName: "ValidationRegistry",
    shovelName: "erc8004_validation_request",
    tableName: "erc8004_validation_request_events",
    addressColumn: "registry",
    eventName: "ValidationRequest",
    inputs: {
      validatorAddress: { column: "validator_address", type: "bytea" },
      agentId: { column: "agent_id", type: "numeric" },
      requestURI: { column: "request_uri", type: "text" },
      requestHash: { column: "request_hash", type: "bytea" },
    },
  }),
  defineEventIntegration({
    contractName: "ValidationRegistry",
    shovelName: "erc8004_validation_response",
    tableName: "erc8004_validation_response_events",
    addressColumn: "registry",
    eventName: "ValidationResponse",
    inputs: {
      validatorAddress: { column: "validator_address", type: "bytea" },
      agentId: { column: "agent_id", type: "numeric" },
      requestHash: { column: "request_hash", type: "bytea" },
      response: { column: "response", type: "numeric" },
      responseURI: { column: "response_uri", type: "text" },
      responseHash: { column: "response_hash", type: "bytea" },
      tag: { column: "tag", type: "text" },
    },
  }),
];
