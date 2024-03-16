"use client";

import { useSafeAccountClient } from "~/components/safe-account-provider";
import { SongCard } from "~/components/song-card";
import { ArtistCard } from "~/components/artist-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/trpc";
import { useEffect } from "react";

export default function Home() {
  const safeAccountClient = useSafeAccountClient();
  const dummyArtists = [
    {
      id: 1,
      name: "John Doe",
      profile_pic: "https://noun-api.com/beta/pfp",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      address: "0x123"
    },
    {
      id: 2,
      name: "Jane Smith",
      profile_pic: "https://noun-api.com/beta/pfp",
      bio: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      address: "0x123"
    },
    // Add more dummy artists as needed
  ];

  const songsQuery = api.songs.list.useQuery();

  console.log({ songsQuery });

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

  // const createSong = () => {
  //   if (!safeAccountClient?.chain || !safeAccountClient?.account) return;
  //   void safeAccountClient.writeContract({
  //     address: contractAddress[84532].EchonomySongRegistry,
  //     account: safeAccountClient.account,
  //     chain: safeAccountClient.chain,
  //     abi: contracts.EchonomySongRegistry,
  //     functionName: "createSongContract",
  //     args: ["Song Name", 1000000000000000000n],
  //   });
  // };

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
        </div>
        <Tabs defaultValue="tunes" className="">
          <div className='flex justify-center'>
            <TabsList className="mt-5">
              <TabsTrigger value="tunes">Browse Tunes</TabsTrigger>
              <TabsTrigger value="artists">Browse Artists</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6">
            <TabsContent value="tunes">
              <div className="text-md my-3 text-2xl font-semibold tracking-tight">
                Recently uploaded
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {!songsQuery || !songsQuery.data && (
                  <div>Loading...</div>
                )}
                {songsQuery?.data?.map((song, i) => (
                  <SongCard
                    key={i}
                    songName={song.title}
                    artistName={song.artistWalletAddress}
                    albumCover={song.artwork}
                    price={song.price}
                    createdAt={song.createdAt}
                    address={song.artistWalletAddress}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="artists">
              <div className="text-md my-3 text-2xl font-semibold tracking-tight">
                All independent artists
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {dummyArtists.map((artist, i) => (
                  <ArtistCard
                    key={i}
                    {...artist}
                  />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
