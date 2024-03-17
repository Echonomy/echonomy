"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { SongCard } from "~/components/song-card";
import { api } from "~/utils/trpc";
import { usePublicClient } from "wagmi";
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { contractAddress } from "~/consts/contracts";
import { contracts } from "~/contracts";

export default function ArtistPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const songData = api.songs.get.useQuery({
    id: Number(id),
  });
  const publicClient = usePublicClient();
  const safeAccountClient = useSafeAccountClient();

  const [canDownload, setCanDownload] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCanDownload(null);
    const checkCanDownload = async () => {
      const address = safeAccountClient?.account?.address;
      if (!songData.data || !publicClient || !address) return;

      const canDownload = await publicClient.readContract({
        abi: contracts.EchonomySongRegistry,
        address: contractAddress[84532].EchonomySongRegistry,
        functionName: "ownsSong",
        args: [address, BigInt(id)],
      });
      if (!cancelled) setCanDownload(canDownload);
    };

    void checkCanDownload();

    return () => {
      cancelled = true;
    };
  }, [id, publicClient, safeAccountClient, songData.data]);

  const buyNFT = async () => {
    const price = songData.data?.price;
    const account = safeAccountClient?.account;
    if (!account || price === undefined) return;
    await safeAccountClient?.writeContract({
      account,
      abi: contracts.EchonomySongRegistry,
      chain: safeAccountClient.chain,
      address: contractAddress[84532].EchonomySongRegistry,
      functionName: "buySong",
      args: [BigInt(id)],
      value: BigInt(price),
    });
    setCanDownload(true);
  };

  const decryptionKeyMutation = api.songs.decryptionKey.useMutation();

  const downloadSong = async () => {
    const address = safeAccountClient?.account?.address;
    const fullSong = songData.data?.fullSong;

    if (!address || !fullSong) return;
    const base64Key = await decryptionKeyMutation.mutateAsync({
      songId: Number(id),
    });
    const key = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from(
        atob(base64Key)
          .split("")
          .map((c) => c.charCodeAt(0)),
      ),
      "AES-GCM",
      true,
      ["encrypt", "decrypt"],
    );
    const encryptedData = await fetch(fullSong).then((res) =>
      res.arrayBuffer(),
    );
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encryptedData.slice(0, 12),
      },
      key,
      encryptedData.slice(12),
    );

    const blob = new Blob([decryptedData], { type: "audio/mpeg" });
    const objectURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    document.body.appendChild(link);
    link.href = objectURL;
    link.href = URL.createObjectURL(blob);
    link.download = "song.mp3";
    link.click();
  };

  if (!songData || !songData.data) return <div>Loading...</div>;

  return (
    <>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
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
            <Link href={`/artist/${songData.data.artist?.walletAddress}`} passHref>
              <div className="mt-5 text-neutral-500 text-xs hover:underline text-center w-full">
                View other tunes by {songData.data.artist?.name}
              </div>
            </Link>
          )}
        </div>
        <div className="flex flex-col items-center justify-center md:col-span-2">
          {canDownload === null && <div>Loading...</div>}
          {canDownload === false && (
            <div>
              <div>You don&apos;t own this NFT</div>
              <Button onClick={buyNFT}>Buy this NFT</Button>
            </div>
          )}
          {canDownload === true && (
            <div>
              <div>You own this NFT</div>
              <Button onClick={downloadSong}>Download</Button>
            </div>
          )}
          <Link href="/" className="mt-5 text-xs hover:underline">
            Discover more NFTs
          </Link>
        </div>
      </div>
    </>
  );
}
