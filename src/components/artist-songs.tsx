"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { SongCard } from "~/components/song-card";
import { contractAddress } from "~/consts/contracts";
import { contracts } from "~/contracts";
import { api } from "~/utils/trpc";

export default function ArtistSongs() {
  const safeAccountClient = useSafeAccountClient();
  const songCards = [
    {
      songName: "Dreamer",
      artistName: "Lucid Waves",
      albumCover: "https://picsum.photos/seed/asdf/200/300",
      price: "$0.99",
      createdAt: "April 1, 2023",
    },
    {
      songName: "Nightfall",
      artistName: "Eclipse",
      albumCover: "https://picsum.photos/seed/asdg/200/300",
      price: "$1.29",
      createdAt: "March 28, 2023",
    },
    {
      songName: "Retrograde",
      artistName: "Voyager IV",
      albumCover: "https://picsum.photos/seed/ashd/200/300",
      price: "$0.79",
      createdAt: "March 15, 2023",
    },
    {
      songName: "Horizon",
      artistName: "Skyline",
      albumCover: "https://picsum.photos/seed/agsd/200/300",
      price: "$1.49",
      createdAt: "April 5, 2023",
    },
    {
      songName: "Ephemeral",
      artistName: "Aether",
      albumCover: "https://picsum.photos/seed/aagsd/200/300",
      price: "$1.09",
      createdAt: "February 20, 2023",
    },
    {
      songName: "Silhouettes",
      artistName: "Shadowplay",
      albumCover: "https://picsum.photos/seed/agasdsd/200/300",
      price: "$0.89",
      createdAt: "January 10, 2023",
    },
    {
      songName: "Cascade",
      artistName: "Waterfall",
      albumCover: "https://picsum.photos/seed/asad/200/300",
      price: "$1.19",
      createdAt: "March 22, 2023",
    },
    {
      songName: "Whispers",
      artistName: "Gentle Breeze",
      albumCover: "https://picsum.photos/seed/asggd/200/300",
      price: "$0.99",
      createdAt: "April 2, 2023",
    },
  ];

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
      <div className="container flex flex-col justify-center px-0">
        <div className="text-md my-4 mt-10 text-2xl font-semibold tracking-tight">
          Your uploaded tunes
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {songCards.map((song, i) => (
            <SongCard
              key={i}
              songName={song.songName}
              artistName={song.artistName}
              albumCover={song.albumCover}
              price={song.price}
              createdAt={song.createdAt}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
