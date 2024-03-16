import EchonomySongRegistry from "./EchonomySongRegistry.json";

export const contracts = {
  EchonomySongRegistry,
} as const;

export type ContractName = keyof typeof contracts;
