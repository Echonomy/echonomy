import * as React from "react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export function SongCard({ songName, artistName, albumCover, price, createdAt }) {
  // Inline style for background image
  const albumCoverStyle = {
    backgroundImage: `url(${albumCover})`,
    backgroundSize: 'cover', // Cover the entire div
    backgroundPosition: 'center', // Center the background image
    height: 250
  };

  return (
    <Card className="w-[500px] h-[700px] flex flex-col overflow-hidden rounded-lg shadow-lg">
      {/* Album cover as background image */}
      <div className="w-full h-64 flex-shrink-0 overflow-hidden" style={albumCoverStyle}></div>
      {/* Text content at the bottom */}
      <CardContent className=" p-4">
        <div className="">
          <h3 className="text-2xl font-bold">{songName}</h3>
          <p className="text-lg">{artistName}</p>
          <p className="text-lg">{price}</p>
          <p className="text-sm">{createdAt}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-white">
        <Button variant="outline" className="m-4">Cancel</Button>
        <Button className="ml-5">Buy</Button>
      </CardFooter>
    </Card>
  );
}