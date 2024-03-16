import * as React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlayIcon, StopIcon } from "@radix-ui/react-icons";
import Tilt from "react-parallax-tilt";
import { formatEther } from "viem";

export function SongCard({
  songName,
  artistName,
  albumCover,
  price,
  previewSong
}: {
  songName: string;
  artistName: string;
  albumCover: string;
  price: string;
  previewSong: string;
  createdAt: Date;
}) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef(new Audio(previewSong));

  // Inline style for background image
  const albumCoverStyle = {
    backgroundImage: `url(${albumCover})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: 250,
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying); // Toggle the state
  };

  // Cleanup audio element when component unmounts
  React.useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.volume = 1.0; // Max volume
      audioRef.current.muted = false;
      audioRef.current.removeAttribute('src'); // This prevents memory leaks
      audioRef.current.load();
    };
  }, []);

  React.useEffect(() => {
    audioRef.current.src = previewSong;
  }, [previewSong]);

  return (
    <Tilt
      tiltReverse
      tiltMaxAngleX={7}
      tiltMaxAngleY={7}
      glareEnable
      className="overflow-hidden rounded-lg"
    >
      <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:cursor-pointer">
        <div
          className="flex h-52 w-full flex-shrink-0 items-center justify-center overflow-hidden"
          style={albumCoverStyle}
        ></div>
        <CardContent className="relative p-4">
          <Button
            variant="outline"
            className="h-15 w-15 absolute right-4 top-0 -mt-7 rounded-full p-2 transition-all hover:scale-110"
            onClick={togglePlay}
          >
            {isPlaying ? <StopIcon className="h-10 w-10 p-2 text-white" /> : <PlayIcon className="h-10 w-10 p-2 text-white" />}
          </Button>
          <div>
            <h3 className="mr-4 font-bold">{songName}</h3>
            <p className="text-sm">{artistName.slice(0, 16)}...</p>
            <p className="mt-1 text-sm">
              {formatEther(BigInt(price))} <span className="text-xs">USDC</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Tilt>
  );
}
