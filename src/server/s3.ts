import { DeleteObjectCommand, GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

export const s3 = new S3({
  region: env.AWS_DEFAULT_REGION,
});

export const getS3Url = (bucket: string, key: string) =>
  `https://${bucket}.s3.${env.AWS_DEFAULT_REGION}.amazonaws.com/${key}`;

export async function getTempFileFromS3(uploadId: string) {
  let data: Uint8Array = new Uint8Array();
  try {
    const file = await s3.send(
      new GetObjectCommand({
        Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
        Key: uploadId,
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

  // TODO uncomment this
  // Cleanup the temp file
  /* await s3.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_TEMP_BUCKET_NAME,
      Key: uploadId,
    }),
  ); */

  return data;
}
