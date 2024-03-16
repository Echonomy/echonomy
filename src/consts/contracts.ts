import { baseSepolia } from "viem/chains";
import { type ContractName } from "~/contracts";
import { type SupportedNetworkId } from "~/utils/networks";

export const contractAddress: Record<
  SupportedNetworkId,
  Record<ContractName, `0x${string}`>
> = {
  [baseSepolia.id]: {
    EchonomySongRegistry: "0x32599235b17F6aA65DBb6AEb0aC48fa182cBd1bd",
  },
};
