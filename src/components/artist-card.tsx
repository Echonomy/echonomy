import * as React from "react";
import { Card, CardContent } from "~/components/ui/card";
import Link from "next/link";
import Tilt from "react-parallax-tilt";

export function ArtistCard({
  name,
  bio,
  avatar,
  walletAddress,
}: {
  name: string;
  bio: string;
  avatar: string | null;
  walletAddress: string;
}) {
  // Inline style for background image
  const albumCoverStyle = {
    backgroundImage: `url(${avatar})`,
    backgroundSize: "cover", // Cover the entire div
    backgroundPosition: "center", // Center the background image
    height: 250,
  };

  return (
    <Link href={`/artist/${walletAddress}`}>
      <Tilt
        tiltReverse
        tiltMaxAngleX={7}
        tiltMaxAngleY={7}
        glareEnable
        className="overflow-hidden rounded-lg"
      >
        <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:cursor-pointer">
          {/* Album cover as background image */}
          <div
            className="flex h-52 w-full flex-shrink-0 items-center justify-center overflow-hidden"
            style={albumCoverStyle}
          ></div>
          {/* Text content at the bottom */}
          <CardContent className="relative p-4">
            {/* <Button
            variant="outline"
            className="h-15 w-15 absolute right-4 top-0 -mt-7 rounded-full p-2  transition-all hover:scale-110"
          >
            <PlayIcon className="h-10 w-10 p-2 text-white" />
          </Button> */}
            <div className="">
              <h3 className="mr-4 font-bold">{name}</h3>
              <p className="text-sm">{bio}</p>
              {/* <p className="text-sm mt-1">{price} <span className="text-xs">USDC</span></p> */}
            </div>
          </CardContent>
          {/* <CardFooter className="px-4 pb-4">
        <Button>Buy</Button>
      </CardFooter> */}
        </Card>
      </Tilt>
    </Link>
  );
}
