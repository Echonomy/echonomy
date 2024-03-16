import deterministicJsonStringify from "json-stringify-deterministic";

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
