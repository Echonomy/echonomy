"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { CreatePost } from "~/components/create-post";
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { SongCard } from "~/components/song-card";
import { contractAddress } from "~/consts/contracts";
import { contracts } from "~/contracts";
import { api } from "~/utils/trpc";

export default function Home() {
  const { data: hello } = api.post.hello.useQuery({ text: "world" });
  const safeAccountClient = useSafeAccountClient();
  const songCards = [{}];

  const createSong = () => {
    if (!safeAccountClient?.chain || !safeAccountClient?.account) return;
    void safeAccountClient.writeContract({
      address: contractAddress[84532].EchonomySongRegistry,
      account: safeAccountClient.account,
      chain: safeAccountClient.chain,
      abi: contracts.EchonomySongRegistry,
      functionName: "createSongContract",
      args: ["Song Name", 1000000000000000000n],
    });
  };

  return (
    <main className="flex flex-col justify-center text-white">
      <div className="container flex flex-col justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            IndieTunes
          </h1>
          <h3 className="mb-2 mt-3">
            a music distribution platform for independent artists, done right.
          </h3>
          {!safeAccountClient?.account ? (
            <>
              <div className="mt-5 flex w-full justify-center">
                <DynamicWidget />
              </div>
            </>
          ) : (
            <div className="text-xs text-neutral-700">
              <span className="font-bold">Your Safe Account:</span>{" "}
              {safeAccountClient?.account?.address}
              <button onClick={createSong} className="ml-2">
                Create Song
              </button>
            </div>
          )}
        </div>

        <div className="text-md my-4 mt-10 text-2xl font-extrabold tracking-tight">
          Recently uploaded
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {songCards.map((x, i) => (
            <SongCard
              key={i}
              songName="Song Name"
              artistName="Artist Name"
              albumCover="https://images.unsplash.com/photo-1707494750832-48a457145d12?q=80&w=2789&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              price="$1.29"
              createdAt="March 10, 2023"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function CrudShowcase() {
  const { data: latestPost } = api.post.getLatest.useQuery();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <CreatePost />
    </div>
  );
}
