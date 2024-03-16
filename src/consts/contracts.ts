import { baseSepolia } from "viem/chains";
import { type ContractName } from "~/contracts";
import { type SupportedNetworkId } from "~/utils/networks";

export const contractAddress: Record<
  SupportedNetworkId,
  Record<Exclude<ContractName, "Safe">, `0x${string}`>
> = {
  [baseSepolia.id]: {
    EchonomySongRegistry: "0x92d0Ff5503A936B6Fb6c1eb09BF403eA3dB448f1",
  },
};
