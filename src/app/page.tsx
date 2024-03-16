"use client";

import { SongCard } from "~/components/song-card";
import { ArtistCard } from "~/components/artist-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/trpc";

export default function Home() {
  const songsQuery = api.songs.list.useQuery();
  const artistsQuery = api.artists.list.useQuery();

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
          <div className="flex justify-center">
            <TabsList className="mt-5">
              <TabsTrigger value="tunes">Browse Tunes</TabsTrigger>
              <TabsTrigger value="artists">Browse Artists</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 mt-10">
            <TabsContent value="tunes">
              <div className="text-md my-3 text-2xl font-semibold tracking-tight">
                Recently uploaded
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {!songsQuery || (!songsQuery.data && <div>Loading...</div>)}
                {songsQuery?.data?.map((song, i) => (
                  <SongCard
                    key={i}
                    previewSong={song.previewSong}
                    songName={song.title}
                    artistName={song.artistWalletAddress}
                    albumCover={song.artwork}
                    price={song.price}
                    createdAt={song.createdAt}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="artists">
              <div className="text-md my-3 text-2xl font-semibold tracking-tight">
                All independent artists
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {artistsQuery.data?.map((artist, i) => (
                  <ArtistCard key={i} {...artist} bio="" />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
