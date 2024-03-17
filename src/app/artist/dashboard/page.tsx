"use client";

import React, { Suspense, useState } from 'react';
import { CreateSongForm } from "~/components/create-song-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ArtistSongs from "~/components/artist-songs";
import { EditProfileForm } from "~/components/edit-profile";
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { useSearchParams } from "next/navigation";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/trpc";
import { env } from "~/env";

export default function ArtistDashboardPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const safeAccountClient = useSafeAccountClient();
  const verifyMutation = api.artists.getTheBlueCheckmarkSwag.useMutation();
  const { data: artist } = api.artists.get.useQuery(
    { walletAddress: safeAccountClient?.account?.address ?? "" },
    { enabled: !!safeAccountClient?.account?.address },
  );
  const deployFanToken = api.fanTokens.deploy.useMutation();
  const mintFanTokens = api.fanTokens.mint.useMutation();

  const generateFanToken = async () => {
    setIsLoading(true);
    await deployFanToken.mutateAsync();
    setIsLoading(false);
  }

  const transferFanTokens = async () => {
    setIsLoading(true);
    await mintFanTokens.mutateAsync({
      amount,
      address: recipientAddress,
    });
    setIsLoading(false);
  };

  console.log({ artist })

  const utils = api.useUtils();

  return (
    <>
      <h1 className="mb-2 mt-7 p-3 text-center text-4xl font-extrabold tracking-tight">
        Artist Dashboard
      </h1>
      <div className="">
        <Tabs defaultValue={searchParams.get("state") ?? "dash"} className="">
          <div className="flex justify-center">
            <TabsList className="">
              <TabsTrigger value="dash">Tunes</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="worldcoin">Verify</TabsTrigger>
              <TabsTrigger value="fantoken">Fan Tokens</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6">
            <TabsContent value="dash">
              {safeAccountClient?.account?.address && (
                <ArtistSongs
                  walletAddress={safeAccountClient.account.address}
                />
              )}
            </TabsContent>
            <TabsContent value="upload">
              <CreateSongForm />
            </TabsContent>
            <TabsContent value="fantoken">
              {artist?.fanTokenContract ? (
                <div className="text-center space-y-4">
                  <Input
                    placeholder="Token Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-input"
                  />
                  <Input
                    placeholder="Recipient Address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="text-input"
                  />
                  <Button className="mt-5" onClick={transferFanTokens} disabled={isLoading}>
                    Gift Fan Tokens
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Button className="mt-5" onClick={generateFanToken} disabled={isLoading}>
                    Generate your Fan Token
                  </Button>
                  <div className="text-xs mt-5 text-neutral-500">
                    You can give fan tokens to your biggest supporters to show your appreciation. These can be used to unlock exclusive perks.
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="worldcoin"
              className="flex flex-col items-center"
            >
              {!artist?.verified ? (
                <IDKitWidget
                  app_id={env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`} // obtained from the Developer Portal
                  action={env.NEXT_PUBLIC_WLD_ACTION_ID} // this is your action id from the Developer Portal
                  onSuccess={(result) =>
                    verifyMutation.mutate(result, {
                      onSettled: () => {
                        void utils.invalidate();
                      },
                    })
                  }
                  verification_level={VerificationLevel.Device}
                >
                  {({ open }) => (
                    <>
                      <Button className="mt-5" onClick={open}>Verify with World ID</Button>
                      <div className="text-xs mt-5 text-neutral-500">Verify you&apos;re a real artist, not a bot for greater discoverability</div>
                    </>
                  )}
                </IDKitWidget>
              ) : (
                "You are verified with Worldcoin!"
              )}
            </TabsContent>
            <TabsContent value="settings">
              <EditProfileForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
