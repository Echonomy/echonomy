import { db } from "~/server/db";
import { createTRPCRouter, procedure } from "../trpc";
import { z } from "zod";
import { mapArtistMetaToDto } from "~/server/mappers";
import { selectArtistMeta } from "~/server/select";
import { TRPCError } from "@trpc/server";

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
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const artist = await db.artist.update({
        where: {
          walletAddress: ctx.walletAddress,
        },
        data: input,
      });

      return artist;
    }),
});
