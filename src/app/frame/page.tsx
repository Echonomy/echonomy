import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { api } from "~/utils/trpc";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Begin"
    }
  ],
  image: `https://cdn.discordapp.com/attachments/1043649157530910791/1217914678865559693/IMAGE_2024-03-14_191803.jpg?ex=6605c26f&is=65f34d6f&hm=57abb49a21bef1fcd2777caf99da18d9c7742255d4cce8a54f096d993b1a9f32&`,
  post_url: `https://echonomy.vercel.app/api/frame?id=1`,
});


export const metadata: Metadata = {

  
  title: 'Cosmic Cowboys',
  description: 'A frame telling the story of Cosmic Cowboys',
  openGraph: {
    title: 'Cosmic Cowboys',
    description: 'A frame telling the story of Cosmic Cowboys',
    images: [],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>Cosmic Cowboys</h1>
    </>
  );
}