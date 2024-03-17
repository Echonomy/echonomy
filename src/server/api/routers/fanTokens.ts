import {
  createPublicClient,
  createWalletClient,
  getContractAddress,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createTRPCRouter, procedure } from "../trpc";
import { env } from "~/env";
import { chiliz } from "viem/chains";
import { EchonomyFanToken } from "~/server/fanTokenStuff";
import { db } from "~/server/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const fanTokensRouter = createTRPCRouter({
  deploy: procedure.private.mutation(async ({ ctx }) => {
    const artist = await db.artist.findUniqueOrThrow({
      where: {
        walletAddress: ctx.walletAddress,
      },
      select: {
        name: true,
      },
    });
    const account = privateKeyToAccount(
      env.FAN_TOKEN_MANAGER_PRIVATE_KEY as `0x${string}`,
    );

    const publicClient = createPublicClient({
      chain: chiliz,
      transport: http(env.NEXT_PUBLIC_CHILIZ_SPICY_RPC_URL),
    });

    const client = createWalletClient({
      account,
      chain: chiliz,
      transport: http(env.NEXT_PUBLIC_CHILIZ_SPICY_RPC_URL),
    });

    const hash = await client.deployContract({
      abi: EchonomyFanToken.abi,
      bytecode: EchonomyFanToken.bytecode.object,
      args: [client.account.address, `${artist.name}'s Fan Token`, "FAN"],
    });

    const tx = await publicClient.getTransaction({
      hash,
    });

    const address = getContractAddress({
      from: account.address,
      nonce: BigInt(tx.nonce),
    });

    await db.artist.update({
      where: {
        walletAddress: ctx.walletAddress,
      },
      data: {
        fanTokenContract: address,
      },
    });
  }),

  mint: procedure.private
    .input(
      z.object({
        to: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const artist = await db.artist.findUniqueOrThrow({
        where: {
          walletAddress: ctx.walletAddress,
        },
        select: {
          fanTokenContract: true,
        },
      });

      if (!artist.fanTokenContract) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fan token contract not deployed",
        });
      }

      const account = privateKeyToAccount(
        env.FAN_TOKEN_MANAGER_PRIVATE_KEY as `0x${string}`,
      );

      const client = createWalletClient({
        account,
        chain: chiliz,
        transport: http(env.NEXT_PUBLIC_CHILIZ_SPICY_RPC_URL),
      });

      await client.writeContract({
        abi: EchonomyFanToken.abi,
        address: artist.fanTokenContract as `0x${string}`,
        functionName: "mint",
        args: [input.to as `0x${string}`, BigInt(input.amount)],
      });
    }),
});
