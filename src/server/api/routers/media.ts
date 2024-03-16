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
import { contractAddress as contractAddresses } from "~/consts/contracts";
import sharp from "sharp";
import { callFFmpeg } from "~/server/ffmpeg";
import { uploadToLighthouse } from "~/server/lighthouse";
import { db } from "~/server/db";

export const mediaRouter = createTRPCRouter({
  insertMetadata: procedure.private
    .input(
      z.object({
        songId: z.string(),
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

      const contract = await viem.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddresses[84532].EchonomySongRegistry,
        functionName: "getSong",
        args: [BigInt(input.songId)],
      });

      const songOwner = await viem.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddresses[84532].EchonomySongRegistry,
        functionName: "getSongOwner",
        args: [BigInt(input.songId)],
      });

      const price = await viem.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddresses[84532].EchonomySongRegistry,
        functionName: "getSongPrice",
        args: [BigInt(input.songId)],
      });

      const safeOwners = await viem.readContract({
        abi: contracts.Safe,
        address: songOwner,
        functionName: "getOwners",
      });

      if (!safeOwners.includes(walletAddress)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not the owner of the song",
        });
      }

      // Try to download the files

      const uploadedArtwork = await getTempFileFromS3(input.artworkUploadId);
      const rawMedia = await getTempFileFromS3(input.mediaUploadId);

      // Normalize the image, process the media

      const [artwork, fullSong, previewSong] = await Promise.all([
        sharp(uploadedArtwork)
          .resize({
            width: 1024,
            height: 1024,
            fit: "cover",
          })
          .jpeg({ quality: 80 })
          .toBuffer(),
        callFFmpeg(rawMedia, "-f mp3"),
        callFFmpeg(rawMedia, "-f mp3 -t 30 -b:a 128k"),
      ]);

      // Encrypt the full song using crypto
      const key = await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"],
      );
      const kek = await crypto.subtle.importKey(
        "raw",
        Buffer.from(env.MEDIA_KEK, "base64"),
        "AES-GCM",
        true,
        ["encrypt", "decrypt"],
      );
      const encryptedKey = Buffer.from(
        await crypto.subtle.encrypt(
          "AES-GCM",
          kek,
          await crypto.subtle.exportKey("raw", key),
        ),
      ).toString("base64");
      const encryptedFullSong = Buffer.from(
        await crypto.subtle.encrypt("AES-GCM", key, fullSong),
      );

      // Upload the files
      const [artworkName, previewSongName, fullSongName] = await Promise.all([
        uploadToLighthouse(artwork),
        uploadToLighthouse(previewSong),
        uploadToLighthouse(encryptedFullSong),
      ]);

      await db.song.create({
        data: {
          id: Number(input.songId),
          title: input.title,
          description: input.description,
          encryptedKey,
          artwork: artworkName,
          previewSong: previewSongName,
          fullSong: fullSongName,
          price: price.toString(),
          contractAddress: contract,
          artistWalletAddress: songOwner,
        },
      });
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
