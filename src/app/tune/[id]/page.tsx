"use client";

import Link from "next/link";
import React from "react";
import { Button } from "~/components/ui/button";
import { SongCard } from "~/components/song-card";
import { api } from "~/utils/trpc";

export default function ArtistPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const songData = api.songs.get.useQuery({
    id: Number(id)
  });

  console.log({ songData, id })

  // const artist = api.artists.get.useQuery({
  //   walletAddress
  // });

  // const artistSongsQuery = api.songs.listByArtist.useQuery({
  //   artistWalletAddress: walletAddress,
  // });
  if (!songData || !songData.data)
    return <div>Loading...</div>

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="md:col-span-1">
          <SongCard
            id={songData.data.id}
            songName={songData.data.title}
            artistName={songData.data.artist?.name}
            albumCover={songData.data.artwork}
            price={songData.data.price}
            createdAt={songData.data.createdAt}
            previewSong={songData.data.previewSong}
          />
          {songData.data.artist?.name && (
            <Link href="/" passHref>
              <div className="mt-5 text-neutral-500 text-xs hover:underline text-center w-full">
                View other tunes by {songData.data.artist?.name}
              </div>
            </Link>
          )}
        </div>
        <div className="md:col-span-2 flex flex-col justify-center items-center">
          <Button type="submit">Buy this NFT</Button>
          <Link href="/" className="mt-5 text-xs hover:underline">
            See all NFTs
          </Link>
        </div>
      </div>
    </>
  );
}
