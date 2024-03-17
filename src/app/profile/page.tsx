"use client";

import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { usePublicClient } from "wagmi";
import { contractAddress } from "~/consts/contracts";
import { type SupportedNetworkId } from "~/utils/networks";
import { contracts } from "~/contracts";
import { api } from "~/utils/trpc";
import { SongCard } from "~/components/song-card";

export default function Page() {
  const safeAccountClient = useSafeAccountClient();
  const publicClient = usePublicClient();
  const songs = api.songs.list.useQuery();
  const [downloadableSongs, setDownloadableSongs] = React.useState<number[]>(
    [],
  );

  useEffect(() => {
    const address = safeAccountClient?.account?.address;
    if (!address) return;

    setDownloadableSongs([]);

    void publicClient
      ?.readContract({
        address:
          contractAddress[publicClient.chain.id as SupportedNetworkId]
            .EchonomySongRegistry,
        abi: contracts.EchonomySongRegistry,
        functionName: "ownedSongs",
        args: [address],
      })
      .then((arr) => setDownloadableSongs(arr.map((x) => Number(x))));
  }, [publicClient, safeAccountClient?.account?.address]);

  return (
    <>
      <h1 className="mb-2 mt-7 p-3 text-center text-4xl font-extrabold tracking-tight">
        My Profile
      </h1>
      <div className="">
        <Tabs defaultValue="dash" className="">
          <div className="flex justify-center">
            <TabsList className="">
              <TabsTrigger value="dash">Collection</TabsTrigger>
              <TabsTrigger value="upload">Fan Tokens</TabsTrigger>
            </TabsList>
          </div>
          <div className="px-6">
            <TabsContent value="dash">
              <main className="flex flex-col justify-center text-white">
                <div className="container flex flex-col justify-center px-0">
                  <div className="text-md my-4 mt-10 text-2xl font-semibold tracking-tight">
                    Your uploaded tunes
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {songs.data
                      ?.filter((song) => downloadableSongs.includes(song.id))
                      .map((song, i) => (
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
            </TabsContent>
            <TabsContent value="upload">Coming soon...</TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
