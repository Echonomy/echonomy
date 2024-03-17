import { baseSepolia } from "viem/chains";
import { type ContractName } from "~/contracts";
import { type SupportedNetworkId } from "~/utils/networks";

export const contractAddress: Record<
  SupportedNetworkId,
  Record<Exclude<ContractName, "Safe">, `0x${string}`>
> = {
  [baseSepolia.id]: {
    EchonomySongRegistry: "0xe63ae6BfC9Ad7F225750F8ADD26e87BC69A9f574",
  },
};
