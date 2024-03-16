import { S3 } from "@aws-sdk/client-s3";
import { env } from "~/env";

export const s3 = new S3({
  region: env.AWS_DEFAULT_REGION,
});

export const getS3Url = (bucket: string, key: string) =>
  `https://${bucket}.s3.${env.AWS_DEFAULT_REGION}.amazonaws.com/${key}`;
