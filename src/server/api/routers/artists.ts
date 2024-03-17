import { db } from "~/server/db";
import { createTRPCRouter, procedure } from "../trpc";
import { z } from "zod";
import { mapArtistMetaToDto } from "~/server/mappers";
import { selectArtistMeta } from "~/server/select";
import { TRPCError } from "@trpc/server";
import { getTempFileFromS3 } from "~/server/s3";
import { uploadToLighthouse } from "~/server/lighthouse";

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
});
