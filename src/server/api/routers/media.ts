import { z } from "zod";
import lighthouse from "@lighthouse-web3/sdk";
import kavach from "@lighthouse-web3/kavach";
import { nanoid } from "nanoid";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { s3 } from "~/server/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  insertMetadata: publicProcedure
    .input(
      z.object({
        uploadId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const file = await s3.send(
        new GetObjectCommand({
          Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
          Key: input.uploadId,
        }),
      );

      if (!file.Body) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File with the given uploadId not found or expired",
        });
      }

      // Cleanup the temp file
      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
          Key: input.uploadId,
        }),
      );

      return {
        length: (await file.Body.transformToByteArray()).length,
      };
    }),

  signedUrl: publicProcedure.query(async () => {
    const filename = nanoid();
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
      Key: filename,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return { uploadId: filename, url };
  }),
});
