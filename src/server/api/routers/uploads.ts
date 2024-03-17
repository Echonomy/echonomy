import { nanoid } from "nanoid";
import { createTRPCRouter, procedure } from "../trpc";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "~/server/s3";

export const uploadsRouter = createTRPCRouter({
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
