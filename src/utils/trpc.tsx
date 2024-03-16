"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import {
  generateSignedProcedurePayload,
  getTypedDataDomainForChainId,
  signatureProtectedMethods,
  typedDataTypes,
} from "./signature";
import { getSafeAccountClient } from "~/components/safe-account-provider";

const createQueryClient = () => new QueryClient();

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

const links = [
  loggerLink({
    enabled: (op) =>
      process.env.NODE_ENV === "development" ||
      (op.direction === "down" && op.result instanceof Error),
  }),
  unstable_httpBatchStreamLink({
    transformer: SuperJSON,
    url: getBaseUrl() + "/api/trpc",
    headers: async ({ opList }) => {
      const headers = new Headers();
      headers.set("x-trpc-source", "nextjs-react");
      const mutationOp = opList.find((op) => op.type === "mutation");
      if (mutationOp && signatureProtectedMethods.includes(mutationOp.path)) {
        const safeAccountClient = getSafeAccountClient();
        if (!safeAccountClient?.account || !safeAccountClient?.chain)
          throw new Error("Cannot call a tRPC mutation without a signature");
        const timestamp = new Date();
        const message = generateSignedProcedurePayload({
          input: mutationOp.input,
          path: mutationOp.path,
          timestamp,
        });

        const domain = getTypedDataDomainForChainId(safeAccountClient.chain.id);

        const signature = await safeAccountClient?.signTypedData({
          account: safeAccountClient.account,
          domain,
          types: typedDataTypes,
          primaryType: "Generic",
          message: {
            contents: message,
          },
        });

        headers.set("X-Ethereum-Timestamp", timestamp.toISOString());
        headers.set("X-Ethereum-Signature", signature);
        headers.set(
          "X-Ethereum-Chain-Id",
          safeAccountClient.chain.id.toString(),
        );
      }
      return headers;
    },
  }),
];

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links,
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (window as any).trpc = createTRPCClient<AppRouter>({
    links,
  });
}
