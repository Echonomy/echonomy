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
  "songs.decryptionKey",
  "artists.getTheBlueCheckmarkSwag",
  "fanTokens.deploy",
  "fanTokens.mint",
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
