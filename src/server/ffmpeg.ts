import { env } from "~/env";

export async function callFFmpeg(input: Uint8Array, ffmpegArguments: string) {
  const body = new FormData();
  body.append("file", new Blob([input]));
  body.append("ffmpegArgs", ffmpegArguments);

  return await fetch(env.FFMPEG_API_URL, {
    method: "POST",
    body,
  })
    .then((res) => res.arrayBuffer())
    .then((res) => new Uint8Array(res));
}
