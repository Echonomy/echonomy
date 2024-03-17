"use client";

import React from "react";
import { ArtistCard } from "~/components/artist-card";
import { SongCard } from "~/components/song-card";
import { api } from "~/utils/trpc";
import { useSafeAccountClient } from "~/components/safe-account-provider";

export default function ArtistPage({
  params: { walletAddress },
}: {
  params: { walletAddress: string };
}) {
  const safeAccountClient = useSafeAccountClient();

  const artist = api.artists.get.useQuery({
    walletAddress,
  });

  const artistSongsQuery = api.songs.listByArtist.useQuery({
    artistWalletAddress: walletAddress,
  });

  const fantokenbal = api.fanTokens.balance.useQuery({
    userWalletAddress: safeAccountClient?.account?.address ?? "",
    artistWalletAddress: walletAddress,
  });

  console.log({ artistSongsQuery })

  return (
    <>
      <h1 className="mb-2 mt-7 p-3 text-center text-4xl font-extrabold tracking-tight">
        Artist Page
      </h1>
      <div className="grid gap-12 pt-7 md:grid-cols-3">
        <div className="md:col-span-1" style={{ borderRight: 1 }}>
          {artist.data && <ArtistCard {...artist.data} />}
          <>
            {
              fantokenbal.data && <div className="p-4 text-center">You currently own {Number(fantokenbal.data)} fan tokens</div>
            }
          </>
        </div>
        <div className="md:col-span-2 w-full">
          <h1 className="text-2xl font-semibold tracking-tight">
            {artist.data?.name} tunes:
          </h1>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            {artistSongsQuery.data?.map((song, i) => (
              <SongCard
                id={song.id}
                key={i}
                songName={song.title}
                artistName={song.artist?.name}
                albumCover={song.artwork}
                price={song.price}
                createdAt={song.createdAt}
                previewSong={song.previewSong}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
