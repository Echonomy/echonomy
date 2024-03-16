import deterministicJsonStringify from "json-stringify-deterministic";
import { type AppRouter } from "~/server/api/root";

type Paths<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

// Only mutations can be signature protected
export const signatureProtectedMethods: string[] = [
  "artists.update",
  "songs.register",
] satisfies Exclude<
  Paths<AppRouter["_def"]["procedures"]>,
  `${string}._def${string}`
>[];

export function generateSignedProcedurePayload({
  input,
  path,
  timestamp,
}: {
  input: unknown;
  path: string;
  timestamp: Date;
}) {
  const deterministicInput = deterministicJsonStringify(input);
  return `Sign to authorize Echonomy call to ${path} with input: ${deterministicInput} at ${timestamp.toISOString()}`;
}

export const getTypedDataDomainForChainId = (chainId: number) =>
  ({
    name: "Echonomy",
    version: "1",
    chainId,
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  }) as const;

// The named list of all type definitions
export const typedDataTypes = {
  Generic: [{ name: "contents", type: "string" }],
} as const;
