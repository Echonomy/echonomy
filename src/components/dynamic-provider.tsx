"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { env } from "~/env";
import { supportedNetworks } from "~/utils/networks";

const wagmiConfig = createConfig({
  chains: supportedNetworks,
  multiInjectedProviderDiscovery: false,
  transports: {
    [baseSepolia.id]: http(env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
});

export function DynamicProvider({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
