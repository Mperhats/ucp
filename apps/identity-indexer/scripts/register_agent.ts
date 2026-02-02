import { identity_registry_abi } from "@ucp/contracts/generated/contracts";
import { contractAddresses } from "@ucp/contracts/generated/addresses";
import { createPublicClient, createWalletClient, http } from "viem";
import * as Address from "ox/Address";
import * as Hex from "ox/Hex";
import { privateKeyToAccount } from "viem/accounts";
import { buildAgentHostUrls } from "../src/utils/agent-utils.js";
import { env } from "../src/env.js";
import { log } from "../src/logger.js";

function getRegistryAddress(chainId: number): Address.Address {
  const addressBook = contractAddresses[chainId];
  if (!addressBook?.IdentityRegistry) {
    throw new Error(`Missing IdentityRegistry address for chain ${chainId}`);
  }
  return Address.from(addressBook.IdentityRegistry);
}

function createClients() {
  const rpcUrl = `http://${env.ANVIL_HOST}:${env.ANVIL_PORT}`;
  Hex.assert(env.ANVIL_DEPLOYER_KEY, { strict: true });
  const deployerKey = env.ANVIL_DEPLOYER_KEY;
  const account = privateKeyToAccount(deployerKey);
  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, transport: http(rpcUrl) });
  return { account, publicClient, walletClient };
}

async function getNextAgentId(args: {
  publicClient: ReturnType<typeof createPublicClient>;
  registryAddress: Address.Address;
}): Promise<bigint> {
  const totalAgents = await args.publicClient.readContract({
    address: args.registryAddress,
    abi: identity_registry_abi,
    functionName: "totalAgents",
  });
  return BigInt(totalAgents) + 1n;
}

async function registerAgent(args: {
  publicClient: ReturnType<typeof createPublicClient>;
  walletClient: ReturnType<typeof createWalletClient>;
  account: ReturnType<typeof privateKeyToAccount>;
  registryAddress: Address.Address;
  agentUri: string;
}): Promise<Hex.Hex> {
  const { request } = await args.publicClient.simulateContract({
    address: args.registryAddress,
    abi: identity_registry_abi,
    functionName: "register",
    args: [args.agentUri],
    account: args.account,
  });
  return await args.walletClient.writeContract(request);
}

async function main(): Promise<void> {
  const { account, publicClient, walletClient } = createClients();
  const chainId = await publicClient.getChainId();

  const registryAddress = getRegistryAddress(chainId);
  const nextAgentId = await getNextAgentId({
    publicClient,
    registryAddress,
  });
  const agentHostUrls = buildAgentHostUrls({
    agentId: nextAgentId.toString(),
    env,
  });
  log.info("agent.uri.ref", agentHostUrls.hostedUcpProfileUrl);
  
  const txHash = await registerAgent({
    publicClient,
    walletClient,
    account,
    registryAddress,
    agentUri: agentHostUrls.hostedUcpProfileUrl,
  });
  console.log(`Registered agent, tx: ${txHash}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
