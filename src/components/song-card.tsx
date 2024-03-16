import * as React from "react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlayIcon } from '@radix-ui/react-icons'
import Tilt from 'react-parallax-tilt';

export function SongCard({ songName, artistName, albumCover, price, createdAt }) {
  // Inline style for background image
  const albumCoverStyle = {
    backgroundImage: `url(${albumCover})`,
    backgroundSize: 'cover', // Cover the entire div
    backgroundPosition: 'center', // Center the background image
    height: 250
  };

  return (
    <Tilt tiltReverse tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable>
      <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:cursor-pointer">
        {/* Album cover as background image */}
        <div className="w-full h-52 flex-shrink-0 overflow-hidden flex justify-center items-center" style={albumCoverStyle}>
        </div>
        {/* Text content at the bottom */}
        <CardContent className="p-4 relative">
          <Button variant="outline" className="h-15 w-15 p-2 rounded-full absolute top-0 -mt-7 right-4  transition-all hover:scale-110"><PlayIcon className="w-10 h-10 p-2 text-white" /></Button>
          <div className="">
            <h3 className="font-bold mr-4">{songName}</h3>
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