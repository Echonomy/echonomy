import { db } from "~/server/db";
import { createTRPCRouter, procedure } from "../trpc";
import { z } from "zod";
import { mapArtistMetaToDto } from "~/server/mappers";
import { selectArtistMeta } from "~/server/select";
import { TRPCError } from "@trpc/server";
import { getTempFileFromS3 } from "~/server/s3";
import { uploadToLighthouse } from "~/server/lighthouse";
import { env } from "~/env";

export const artistsRouter = createTRPCRouter({
  list: procedure.public.query(() => {
    return db.artist
      .findMany({
        select: selectArtistMeta,
      })
      .then((artists) => artists.map((artist) => mapArtistMetaToDto(artist)));
  }),

  get: procedure.public
    .input(
      z.object({
        walletAddress: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const artist = await db.artist.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
        select: selectArtistMeta,
      });

      if (!artist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist not found",
        });
      }

      return mapArtistMetaToDto(artist);
    }),

  update: procedure.private
    .input(
      z.object({
        name: z.string(),
        bio: z.string(),
        avatar: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let avatar: string | undefined = undefined;
      if (input.avatar) {
        const data = await getTempFileFromS3(input.avatar);
        avatar = await uploadToLighthouse(Buffer.from(data));
      }
      await db.artist.upsert({
        where: {
          walletAddress: ctx.walletAddress,
        },
        create: {
          walletAddress: ctx.walletAddress,
          name: input.name ?? "Unknown",
          bio: input.bio ?? "",
          avatar,
        },
        update: {
          name: input.name,
          bio: input.bio,
          avatar,
        },
      });
    }),

  getTheBlueCheckmarkSwag: procedure.private
    .input(
      z.object({
        merkle_root: z.string(),
        nullifier_hash: z.string(),
        proof: z.string(),
        verification_level: z.string(),
        signal: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await fetch(
        `https://developer.worldcoin.org/api/v1/verify/${env.NEXT_PUBLIC_WLD_APP_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...input,
            signal: input.signal ?? "",
            action: env.NEXT_PUBLIC_WLD_ACTION_ID,
          }),
        },
      );
      if (!res.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Worldcoin verification failed",
        });
      }

      await db.artist.update({
        where: {
          walletAddress: ctx.walletAddress,
        },
        data: {
          verified: true,
        },
      });
    }),
});
