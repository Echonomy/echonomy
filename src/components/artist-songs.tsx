"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { SongCard } from "~/components/song-card";
import { contractAddress } from "~/consts/contracts";
import { contracts } from "~/contracts";
import { api } from "~/utils/trpc";

export default function ArtistSongs({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const songs = api.songs.listByArtist.useQuery({
    artistWalletAddress: walletAddress,
  });

  return (
    <main className="flex flex-col justify-center text-white">
      <div className="container flex flex-col justify-center px-0">
        <div className="text-md my-4 mt-10 text-2xl font-semibold tracking-tight">
          Your uploaded tunes
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {songs.data?.map((song, i) => (
            <SongCard
              key={i}
              id={song.id}
              songName={song.title}
              artistName={song.artist.name}
              albumCover={song.artwork}
              price={song.price}
              previewSong={song.previewSong}
              createdAt={song.createdAt}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
