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
import { selectSongMeta } from "~/server/select";
import { mapSongMetaToDto } from "~/server/mappers";

export const songsRouter = createTRPCRouter({
  list: procedure.public.query(() => {
    return db.song
      .findMany({
        select: selectSongMeta,
      })
      .then((songs) => songs.map(mapSongMetaToDto));
  }),

  listByArtist: procedure.public
    .input(
      z.object({
        artistWalletAddress: z.string(),
      }),
    )
    .query(({ input }) => {
      return db.song
        .findMany({
          select: selectSongMeta,
          where: {
            artistWalletAddress: input.artistWalletAddress,
          },
        })
        .then((songs) => songs.map(mapSongMetaToDto));
    }),

  get: procedure.public
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const song = await db.song.findUnique({
        where: {
          id: input.id,
        },
        select: selectSongMeta,
      });

      if (!song) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Song not found",
        });
      }

      return mapSongMetaToDto(song);
    }),

  register: procedure.private
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
      const id = nanoid();

      const log = (message: string) => {
        console.log(`[insertMetadata ${id}] ${message}`);
      };

      const viem = createPublicClient({
        chain: baseSepolia,
        transport: http(env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
      });

      log("Checking permissions...");

      const songOwner = await viem.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddresses[84532].EchonomySongRegistry,
        functionName: "songOwner",
        args: [BigInt(input.songId)],
      });

      if (songOwner !== walletAddress) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not the owner of the song",
        });
      }

      log("Loading blockchain data...");

      const contract = await viem.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddresses[84532].EchonomySongRegistry,
        functionName: "song",
        args: [BigInt(input.songId)],
      });

      const price = await viem.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddresses[84532].EchonomySongRegistry,
        functionName: "songPrice",
        args: [BigInt(input.songId)],
      });

      log("Getting files from S3...");

      // Try to download the files

      const uploadedArtwork = await getTempFileFromS3(input.artworkUploadId);
      const rawMedia = await getTempFileFromS3(input.mediaUploadId);

      // Normalize the image, process the media

      log("Normalize the image and process the media with ffmpeg...");

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

      log("Generate a key and encrypt it using KEK...");

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
      const encryptedKeyIv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedKey = Buffer.concat([
        Buffer.from(encryptedKeyIv),
        Buffer.from(
          await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv: new Uint8Array(12),
            },
            kek,
            await crypto.subtle.exportKey("raw", key),
          ),
        ),
      ]).toString("base64");

      log("Encrypt the full song...");

      const encryptedFullSongIv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedFullSong = Buffer.concat([
        Buffer.from(encryptedFullSongIv),
        Buffer.from(
          await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv: new Uint8Array(12),
            },
            key,
            fullSong,
          ),
        ),
      ]);

      log("Upload to lighthouse...");

      // Upload the files
      const [artworkName, previewSongName, fullSongName] = await Promise.all([
        uploadToLighthouse(artwork),
        uploadToLighthouse(Buffer.from(previewSong)),
        uploadToLighthouse(Buffer.from(encryptedFullSong)),
      ]);

      log("Save info in DB...");

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
          artist: {
            connectOrCreate: {
              where: {
                walletAddress: songOwner,
              },
              create: {
                walletAddress: songOwner,
                name: "Unknown",
              },
            },
          },
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
