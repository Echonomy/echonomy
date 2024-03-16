import { z } from "zod";
import { nanoid } from "nanoid";

import { createTRPCRouter, procedure } from "~/server/api/trpc";
import { env } from "~/env";
import { s3 } from "~/server/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";

export const mediaRouter = createTRPCRouter({
  insertMetadata: procedure
    .input(
      z.object({
        uploadId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      let data: Uint8Array = new Uint8Array();
      try {
        const file = await s3.send(
          new GetObjectCommand({
            Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
            Key: input.uploadId,
          }),
        );
        if (!file.Body) {
          throw new Error("Missing body");
        }
        data = await file.Body.transformToByteArray();
      } catch (err) {
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
        length: data.length,
      };
    }),

  signedUrl: procedure.query(async () => {
    const filename = nanoid();
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
      Key: filename,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return { uploadId: filename, url };
  }),
});
