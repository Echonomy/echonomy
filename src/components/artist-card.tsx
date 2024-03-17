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
  bio: string | null;
  avatar: string | null;
  walletAddress: string;
}) {
  // Inline style for background image
  const albumCoverStyle = {
    backgroundImage: `url(${avatar ?? `https://api.cloudnouns.com/v1/pfp?text=${walletAddress}`})`,
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
            <div className="">
              <h3 className="mr-4 font-bold">{name}</h3>
              <p className="text-sm">{bio}</p>
            </div>
          </CardContent>
        </Card>
      </Tilt>
    </Link>
  );
}
