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
] satisfies Exclude<
  Paths<AppRouter["_def"]["procedures"]>,
  `${string}._def${string}`
>[];
