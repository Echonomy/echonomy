import { baseSepolia } from "viem/chains";
import { type ContractName } from "~/contracts";
import { type SupportedNetworkId } from "~/utils/networks";

export const contractAddress: Record<
  SupportedNetworkId,
  Record<Exclude<ContractName, "Safe" | "IERC20">, `0x${string}`>
> = {
  [baseSepolia.id]: {
    EchonomySongRegistry: "0xe63ae6BfC9Ad7F225750F8ADD26e87BC69A9f574",
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
};
