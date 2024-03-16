"use client";

import { useParams } from "react-router-dom"; // Assuming you're using react-router for routing
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { SongCard } from "~/components/song-card";
import { api } from "~/utils/trpc";

export default function Song() {
  const { nftId } = useParams();
  const safeAccountClient = useSafeAccountClient();
  const { data: nftData } = api.nft.getNFT.useQuery({ id: nftId });

  if (!nftData) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-col justify-center text-white">
      <div className="container flex flex-col justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            {nftData.songName}
          </h1>
          <h3 className="mt-3 mb-2">
            {nftData.artistName}
          </h3>
          {
            !safeAccountClient?.account ? (
              <div className="text-xs text-neutral-700">Please connect your account to view NFT details.</div>
            ) : (
              <SongCard
                songName={nftData.songName}
                artistName={nftData.artistName}
                albumCover={nftData.albumCover}
                price={nftData.price}
                createdAt={nftData.createdAt}
              />
            )
          }
        </div>
      </div>
    </main>
  );
}