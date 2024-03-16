"use client";
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { CreateSongForm } from "~/components/create-song-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import ArtistSongs from "~/components/artist-songs"
import { EditProfileForm } from '~/components/edit-profile';


export const Dashboard = () => {
  const router = useRouter();
  const { state } = router.query;

  return (
    <>
      <h1 className="mb-2 mt-7 p-3 text-center text-4xl font-extrabold tracking-tight">
        Artist Dashboard
      </h1>
      <div className="">
        <Tabs defaultValue={state ?? "dash"} className="">
          <div className="flex justify-center">
            <TabsList className="">
              <TabsTrigger value="dash">Tunes</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6">
            <TabsContent value="dash"><ArtistSongs /></TabsContent>
            <TabsContent value="upload"><CreateSongForm /></TabsContent>
            <TabsContent value="settings"><EditProfileForm /></TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

const UploadedTunesContent = () => {
  // Logic for displaying uploaded tunes content
  return <div>Uploaded Tunes Content</div>;
};

const UploadNewTuneContent = () => {
  // Logic for displaying upload new tune content
  return <div>Upload New Tune</div>;
};

export default Dashboard;
