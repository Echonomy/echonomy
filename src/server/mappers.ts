import { Prisma } from "@prisma/client";
import { selectArtistMeta, selectSongMeta } from "./select";

const songMetaValidator = Prisma.validator<Prisma.SongDefaultArgs>()({
  select: selectSongMeta,
});

export function mapSongMetaToDto(
  song: Prisma.SongGetPayload<typeof songMetaValidator>,
): Prisma.SongGetPayload<typeof songMetaValidator> {
  return {
    ...song,
    artwork: "https://gateway.lighthouse.storage/ipfs/" + song.artwork,
    previewSong: "https://gateway.lighthouse.storage/ipfs/" + song.previewSong,
    fullSong: "https://gateway.lighthouse.storage/ipfs/" + song.fullSong,
    artist: song.artist && mapArtistMetaToDto(song.artist),
  };
}

const artistMetaValidator = Prisma.validator<Prisma.ArtistDefaultArgs>()({
  select: selectArtistMeta,
});

export function mapArtistMetaToDto(
  artist: Prisma.ArtistGetPayload<typeof artistMetaValidator>,
): Prisma.ArtistGetPayload<typeof artistMetaValidator> {
  return {
    ...artist,
    avatar:
      artist.avatar &&
      "https://gateway.lighthouse.storage/ipfs/" + artist.avatar,
  };
}
