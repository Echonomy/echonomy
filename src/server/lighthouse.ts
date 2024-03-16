import lighthouse from "@lighthouse-web3/sdk";
import { env } from "~/env";

export async function uploadToLighthouse(input: Uint8Array) {
  const result: {
    data: {
      Name: string;
      Hash: string;
      Size: string;
    };
  } = await lighthouse.uploadBuffer(input, env.LIGHTHOUSE_API_KEY);

  return result.data.Name;
}
