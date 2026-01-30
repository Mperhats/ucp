import type { Column } from "@indexsupply/shovel-config";
import type { Abi, ExtractAbiEvent, ExtractAbiEventNames } from "abitype";
import type { contracts } from "@ucp/contracts";
import type { AppEnv } from "../src/env.js";

export type EnvVars = AppEnv;

export type EventInputNames<
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>,
> = ExtractAbiEvent<TAbi, TEventName>["inputs"][number]["name"];

export interface EventInputColumn {
  column: string;
  type: Column["type"];
}

export type EventInputMapping<
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>,
> = Partial<
  Record<Extract<EventInputNames<TAbi, TEventName>, string>, EventInputColumn>
>;

export interface EventMapping<
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>,
> {
  name: TEventName;
  inputs: EventInputMapping<TAbi, TEventName>;
}

export interface ContractIntegrationConfig<
  TContractName extends keyof typeof contracts,
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>,
> {
  contractName: TContractName;
  abi: TAbi;
  shovelName: string;
  table: { name: string; addressColumn: string };
  event: EventMapping<TAbi, TEventName>;
}

export type AnyContractIntegrationConfig = ContractIntegrationConfig<
  keyof typeof contracts,
  Abi,
  ExtractAbiEventNames<Abi>
>;
