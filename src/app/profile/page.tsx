"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ArtistSongs from "~/components/artist-songs";

export const Dashboard = () => {
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
              <ArtistSongs />
            </TabsContent>
            <TabsContent value="upload">Coming soon...</TabsContent>
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
