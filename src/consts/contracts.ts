import { baseSepolia } from "viem/chains";
import { type ContractName } from "~/contracts";
import { type SupportedNetworkId } from "~/utils/networks";

export const contractAddress: Record<
  SupportedNetworkId,
  Record<Exclude<ContractName, "Safe">, `0x${string}`>
> = {
  [baseSepolia.id]: {
    EchonomySongRegistry: "0xEA16FC8824A5Cb725E5f4c6180B04d4Bf63740Db",
  },
};
