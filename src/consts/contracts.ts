import { baseSepolia } from "viem/chains";
import { type ContractName } from "~/contracts";
import { type SupportedNetworkId } from "~/utils/networks";

export const contractAddress: Record<
  SupportedNetworkId,
  Record<Exclude<ContractName, "Safe">, `0x${string}`>
> = {
  [baseSepolia.id]: {
    EchonomySongRegistry: "0x14c057f7B643b1eA5B0cFc54b7cfF399c277B57f",
  },
};
