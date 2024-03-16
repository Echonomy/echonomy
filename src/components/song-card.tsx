import * as React from "react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlayIcon } from "@radix-ui/react-icons";
import Tilt from "react-parallax-tilt";

export function SongCard({
  songName,
  artistName,
  albumCover,
  price,
}: {
  songName: string;
  artistName: string;
  albumCover: string;
  price: string;
  createdAt: string;
}) {
  // Inline style for background image
  const albumCoverStyle = {
    backgroundImage: `url(${albumCover})`,
    backgroundSize: "cover", // Cover the entire div
    backgroundPosition: "center", // Center the background image
    height: 250,
  };

  return (
    <Tilt tiltReverse tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable>
      <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:cursor-pointer">
        {/* Album cover as background image */}
        <div
          className="flex h-52 w-full flex-shrink-0 items-center justify-center overflow-hidden"
          style={albumCoverStyle}
        ></div>
        {/* Text content at the bottom */}
        <CardContent className="relative p-4">
          <Button
            variant="outline"
            className="h-15 w-15 absolute right-4 top-0 -mt-7 rounded-full p-2  transition-all hover:scale-110"
          >
            <PlayIcon className="h-10 w-10 p-2 text-white" />
          </Button>
          <div className="">
            <h3 className="mr-4 font-bold">{songName}</h3>
            <p className="text-sm">{artistName}</p>
            <p className="text-sm">{price}</p>
          </div>
        </CardContent>
        {/* <CardFooter className="px-4 pb-4">
        <Button>Buy</Button>
      </CardFooter> */}
      </Card>
    </Tilt>
  );
}