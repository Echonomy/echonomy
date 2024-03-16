/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { recoverTypedDataAddress } from "viem";
import { ZodError } from "zod";

import { db } from "~/server/db";
import {
  generateSignedProcedurePayload,
  getTypedDataDomainForChainId,
  signatureProtectedMethods,
  typedDataTypes,
} from "~/utils/signature";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const procedure = {
  public: t.procedure,
  private: t.procedure.use(async ({ ctx, getRawInput, path, next }) => {
    if (!signatureProtectedMethods.includes(path))
      throw new Error("Path is not included in signatureProtectedMethods");

    const signature = ctx.headers.get("X-Ethereum-Signature");
    const chainId = Number(ctx.headers.get("X-Ethereum-Chain-Id"));
    const timestamp = ctx.headers.get("X-Ethereum-Timestamp");

    if (!signature || !chainId || !timestamp) {
      throw new TRPCError({
        message: "No signature found",
        code: "UNAUTHORIZED",
      });
    }

    const message = generateSignedProcedurePayload({
      input: await getRawInput(),
      path,
      timestamp: new Date(timestamp),
    });

    console.log("Received", { message, signature });

    if (!/^0x[0-9a-fA-F]+$/.test(signature)) {
      throw new TRPCError({
        message: "Invalid signature",
        code: "UNAUTHORIZED",
      });
    }

    let walletAddress: `0x${string}`;

    try {
      walletAddress = await recoverTypedDataAddress({
        domain: getTypedDataDomainForChainId(chainId),
        types: typedDataTypes,
        primaryType: "Generic",
        message: {
          contents: message,
        },
        signature: signature as `0x${string}`,
      });
    } catch (err) {
      throw new TRPCError({
        message: "Invalid signature",
        code: "UNAUTHORIZED",
      });
    }

    return next({ ctx: { ...ctx, chainId, walletAddress } });
  }),
};
