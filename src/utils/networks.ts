import { baseSepolia } from "wagmi/chains";

export const supportedNetworks = [baseSepolia] as const;
export const supportedNetworkIds = supportedNetworks.map((n) => n.id);

export type SupportedNetworkId = (typeof supportedNetworkIds)[number];
