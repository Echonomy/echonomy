"use client";

import React, { useState } from 'react';
import { ArtistCard } from '~/components/artist-card';
import { SongCard } from "~/components/song-card";

export const ArtistPage = () => {

  const dummyArtists = {
    id: 1,
    name: "John Doe",
    profile_pic: "https://noun-api.com/beta/pfp",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    address: "0x123"
  };

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

  return (
    <>
      <h1 className="text-4xl mb-2 text-center mt-7 font-extrabold tracking-tight p-3">
        Artist Page
      </h1>
      <div className="grid gap-12 md:grid-cols-3 pt-7 px-4">
        <div className="md:col-span-1">
          <ArtistCard {...dummyArtists} />
        </div>
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {dummyArtists.name}s tunes:
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 mt-4">

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
      </div >
    </>
  );
};

export default ArtistPage;