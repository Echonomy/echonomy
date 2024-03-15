"use client";

import {
  ENTRYPOINT_ADDRESS_V06,
  ENTRYPOINT_ADDRESS_V07,
  type SmartAccountClient,
  bundlerActions,
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import { pimlicoBundlerActions } from "permissionless/actions/pimlico";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, http } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import { env } from "~/env";
import { type SupportedNetworkId, supportedNetworks } from "~/utils/networks";

type SafeAccountClient = SmartAccountClient<typeof ENTRYPOINT_ADDRESS_V06>;

const SafeAccountContext = createContext<SafeAccountClient | null>(null);

export function useSafeAccountClient() {
  return useContext(SafeAccountContext);
}

const pimlicoNetworkNames: Record<SupportedNetworkId, string> = {
  [baseSepolia.id]: "base-sepolia",
};

export function SafeAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [smartAccountClient, setSmartAccountClient] =
    useState<SafeAccountClient | null>(null);

  useEffect(() => {
    if (!walletClient || !publicClient) {
      return;
    }

    const networkId = walletClient.chain.id;
    const network = supportedNetworks.find((n) => n.id === networkId);

    if (!network) {
      throw new Error(`Unsupported network: ${networkId}`);
    }

    const bundlerTransport = http(
      `https://api.pimlico.io/v2/${pimlicoNetworkNames[network.id]}/rpc?apikey=${
        env.NEXT_PUBLIC_PIMLICO_API_KEY
      }`,
    );

    const paymasterClient = createPimlicoPaymasterClient({
      transport: bundlerTransport,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });

    const pimlicoBundlerClient = createClient({
      chain: sepolia,
      transport: bundlerTransport,
    })
      .extend(bundlerActions(ENTRYPOINT_ADDRESS_V07))
      .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V07));

    const customSigner = walletClientToSmartAccountSigner(walletClient);

    void signerToSafeSmartAccount(publicClient, {
      signer: customSigner,
      safeVersion: "1.4.1",
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    }).then((account) => {
      setSmartAccountClient(
        createSmartAccountClient({
          account,
          entryPoint: ENTRYPOINT_ADDRESS_V06,
          chain: sepolia,
          bundlerTransport,
          middleware: {
            gasPrice: async () =>
              (await pimlicoBundlerClient.getUserOperationGasPrice()).fast,
            sponsorUserOperation: paymasterClient.sponsorUserOperation,
          },
        }),
      );
    });
  }, [walletClient, publicClient]);

  return (
    <SafeAccountContext.Provider value={smartAccountClient}>
      {children}
    </SafeAccountContext.Provider>
  );
}
