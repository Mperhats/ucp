import type { Column, Integration, Source } from "@indexsupply/shovel-config";
import type { Abi, AbiEvent } from "abitype";
import type { AnyContractIntegrationConfig, EnvVars } from "./shovel-types.js";
import { contractAddresses } from "@ucp/contracts";

export function buildShovelSource(env: EnvVars): Source {
  return {
    name: "local",
    chain_id: env.CHAIN_ID,
    url: env.ETH_RPC_URL,
    urls: [env.ETH_RPC_URL],
  };
}

export function readDeployAddress(args: {
  chainId: number;
  contractName: string;
}): string {
  if (Object.keys(contractAddresses).length === 0) {
    throw new Error(
      "No contract addresses generated. Run: pnpm generate:contracts",
    );
  }
  const byChain = contractAddresses[args.chainId];
  if (!byChain) {
    throw new Error(
      `No addresses found for chain ${args.chainId}. ` +
        "Run: pnpm generate:contracts",
    );
  }
  const address = byChain[args.contractName];
  if (!address) {
    throw new Error(
      `No deploy address found for ${args.contractName} on chain ${args.chainId}. ` +
        "Run: pnpm generate:contracts",
    );
  }
  return address.toLowerCase();
}

function findEvent(abi: Abi, name: string): AbiEvent {
  const event = abi.find(
    (item): item is AbiEvent => item.type === "event" && item.name === name,
  );
  if (!event) {
    throw new Error(`Event ${name} not found in ABI`);
  }
  return event;
}

function hasInputName(
  input: AbiEvent["inputs"][number],
): input is AbiEvent["inputs"][number] & { name: string } {
  return typeof input.name === "string" && input.name.length > 0;
}

export function buildEventIntegration(args: {
  contract: AnyContractIntegrationConfig;
  registryAddress: string;
  startBlock: number;
  sourceName: string;
}): Integration {
  const eventInputs = args.contract.event.inputs;
  const event = findEvent(args.contract.abi, args.contract.event.name);
  const mappedInputs = event.inputs
    .filter(hasInputName)
    .map((input) => {
      const mapping = eventInputs[input.name];
      if (!mapping) return null;
      return {
        name: input.name,
        type: input.type,
        indexed: input.indexed,
        column: mapping.column,
        columnType: mapping.type,
      };
    })
    .filter((input): input is NonNullable<typeof input> => !!input);
  const columns: Column[] = [
    { name: "chain_id", type: "int" },
    { name: "block_num", type: "numeric" },
    { name: "tx_hash", type: "bytea" },
    { name: "log_idx", type: "int" },
    { name: args.contract.table.addressColumn, type: "bytea" },
    ...mappedInputs.map((input) => ({
      name: input.column,
      type: input.columnType,
    })),
  ];

  return {
    name: args.contract.shovelName,
    enabled: true,
    sources: [{ name: args.sourceName, start: BigInt(args.startBlock) }],
    table: {
      name: args.contract.table.name,
      columns,
    },
    block: [
      { name: "chain_id", column: "chain_id" },
      { name: "block_num", column: "block_num" },
      { name: "tx_hash", column: "tx_hash" },
      { name: "log_idx", column: "log_idx" },
      {
        name: "log_addr",
        column: args.contract.table.addressColumn,
        filter_op: "contains",
        filter_arg: [args.registryAddress as `0x${string}`],
      },
    ],
    event: {
      type: "event",
      name: args.contract.event.name,
      anonymous: false,
      inputs: mappedInputs.map((input) => ({
        indexed: input.indexed,
        name: input.name,
        type: input.type,
        column: input.column,
      })),
    },
  };
}
