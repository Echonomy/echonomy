import { z } from "zod";
import { nanoid } from "nanoid";

import { createTRPCRouter, procedure } from "~/server/api/trpc";
import { env } from "~/env";
import { getTempFileFromS3, s3 } from "~/server/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { contracts } from "~/contracts";
import { contractAddress } from "~/consts/contracts";
import sharp from "sharp";
import { callFFmpeg } from "~/server/ffmpeg";

export const mediaRouter = createTRPCRouter({
  insertMetadata: procedure.private
    .input(
      z.object({
        songId: z.bigint(),
        title: z.string(),
        description: z.string(),
        artworkUploadId: z.string(),
        mediaUploadId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { chainId, walletAddress }, input }) => {
      // Check permissions

      const viem = createPublicClient({
        chain: baseSepolia,
        transport: http(env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
      });

      const songOwner = await viem.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddress[84532].EchonomySongRegistry,
        functionName: "getSongOwner",
        args: [input.songId],
      });

      if (songOwner !== walletAddress) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not the owner of the song",
        });
      }

      // Try to download the files

      const uploadedArtwork = await getTempFileFromS3(input.artworkUploadId);
      const rawMedia = await getTempFileFromS3(input.mediaUploadId);

      // Normalize the image

      const artwork = await sharp(uploadedArtwork)
        .resize({
          width: 1024,
          height: 1024,
          fit: "cover",
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const [fullSong, previewSong] = await Promise.all([
        callFFmpeg(rawMedia, ""),
        callFFmpeg(rawMedia, "-t 30 -b:a 128k"),
      ]);

      return {
        artworkLength: artwork.length,
        fullSongLength: fullSong.length,
        previewSongLength: previewSong.length,
      };
    }),

  signedUrl: procedure.public.mutation(async () => {
    const filename = nanoid();
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
      Key: filename,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return { uploadId: filename, url };
  }),
});
