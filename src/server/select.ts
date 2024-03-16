import { type Prisma } from "@prisma/client";

export const selectArtistMeta = {
  walletAddress: true,
  name: true,
  avatar: true,
} as const satisfies Prisma.ArtistSelect;

export const selectSongMeta = {
  id: true,
  title: true,
  artistWalletAddress: true,
  artwork: true,
  previewSong: true,
  fullSong: true,
  artist: {
    select: selectArtistMeta,
  },
} as const satisfies Prisma.SongSelect;
