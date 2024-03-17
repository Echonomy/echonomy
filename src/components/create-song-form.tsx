import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/utils/trpc";
import Dropzone from "~/components/ui/dropzone";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormItem,
} from "~/components/ui/form";
import { SongCard } from "./song-card";
import { useSafeAccountClient } from "./safe-account-provider";
import { contracts } from "~/contracts";
import { contractAddress } from "~/consts/contracts";
import { usePublicClient } from "wagmi";
import { baseSepolia } from "viem/chains";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  price: z.string(),
  artwork: z.string().min(1, {
    message: "Artwork is required",
  }),
  media: z.string().min(1, {
    message: "Song is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const CreateSongForm = () => {
  const safeAccountClient = useSafeAccountClient();
  const publicClient = usePublicClient();
  const [artworkFile, setArtworkFile] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Title",
      description: "",
      price: "0",
      artwork: "",
      media: "",
    },
  });

  const registerSongMutation = api.songs.register.useMutation();
  const signedUrlQuery = api.uploads.signedUrl.useMutation();

  const fields = form.watch();

  const handleDropArtwork = async (acceptedFiles: FileList | null) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const allowedTypes = [
        { name: "jpg", types: ["image/jpeg"] },
        { name: "png", types: ["image/png"] },
      ];
      const fileType = allowedTypes.find((allowedType) =>
        allowedType.types.find((type) => type === acceptedFiles?.[0]?.type),
      );
      if (!fileType) {
        form.setValue("artwork", "");
        form.setError("artwork", {
          message: "File type is not valid",
          type: "typeError",
        });
      } else {
        const artworkFile = acceptedFiles?.[0];
        if (!artworkFile) return;
        const albumCover = URL.createObjectURL(artworkFile); // Convert the File object to a data URL
        setArtworkFile(albumCover);

        // Get the signed URL for artwork upload
        const signedUrl = await signedUrlQuery.mutateAsync();

        // Upload artwork to S3 using the signed URL
        const x = await fetch(signedUrl?.url, {
          method: "PUT",
          body: artworkFile,
          headers: {
            "Content-Type": artworkFile.type,
          },
        });

        // Save the artwork URL in the form data
        form.setValue("artwork", signedUrl.uploadId);
      }
    } else {
      form.setValue("artwork", "");
      form.setError("artwork", {
        message: "Artwork is required",
        type: "typeError",
      });
    }
  };

  const handleDropMusic = async (acceptedFiles: FileList | null) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const allowedTypes = [{ name: "mp3", types: ["audio/mpeg"] }];
      const fileType = allowedTypes.find((allowedType) =>
        allowedType.types.find((type) => type === acceptedFiles?.[0]?.type),
      );
      if (!fileType) {
        form.setValue("media", "");
        form.setError("media", {
          message: "File type is not valid",
          type: "typeError",
        });
      } else {
        const mediaFile = acceptedFiles?.[0];
        if (!mediaFile) return;

        // Get the signed URL for media upload
        const signedUrl = await signedUrlQuery.mutateAsync();

        // Upload media to S3 using the signed URL
        await fetch(signedUrl?.url, {
          method: "PUT",
          body: mediaFile,
          headers: {
            "Content-Type": mediaFile.type,
          },
        });

        // Save the artwork URL in the form data
        form.setValue("media", signedUrl.uploadId);
      }
    } else {
      form.setValue("media", "");
      form.setError("media", {
        message: "Song is required",
        type: "typeError",
      });
    }
  };

  const handleFormSubmit = form.handleSubmit(async (formValues) => {
    if (!safeAccountClient?.account || !safeAccountClient.chain) return;

    await safeAccountClient?.writeContract({
      account: safeAccountClient.account,
      abi: contracts.EchonomySongRegistry,
      address: contractAddress[baseSepolia.id].EchonomySongRegistry,
      functionName: "createSongContract",
      chain: safeAccountClient.chain,
      args: [
        (BigInt(Number(fields.price) * 100) *
          1n ** BigInt(safeAccountClient.chain.nativeCurrency.decimals)) /
          100n,
      ],
    });

    const songId = await publicClient?.readContract({
      abi: contracts.EchonomySongRegistry,
      address: contractAddress[baseSepolia.id].EchonomySongRegistry,
      functionName: "songCount",
    });

    if (!songId) throw new Error("Failed to create song contract");

    // Submit the form data and artwork URL to save the metadata for the song
    await registerSongMutation.mutateAsync({
      songId: songId.toString(),
      title: formValues.title,
      description: formValues.description,
      artworkUploadId: formValues.artwork,
      mediaUploadId: formValues.media,
    });
  });

  return (
    <form onSubmit={handleFormSubmit}>
      <Form {...form}>
        <div className="text-md my-4 mt-10 text-2xl font-semibold tracking-tight">
          Create a new Tune
        </div>
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <FormField
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the title of your tune.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the description of your tune.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter price" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the price you want users to pay for this tune in USDC.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="artwork"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artwork</FormLabel>
                  <FormControl>
                    {/* <Input type="file" {...field} /> */}
                    <Dropzone
                      {...field}
                      dropMessage="Drop files or click here"
                      handleOnDrop={handleDropArtwork}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your tune&apos;s artwork in an image file format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="media"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tune File</FormLabel>
                  <FormControl>
                    {/* <Input type="file" {...field} /> */}
                    <Dropzone
                      {...field}
                      dropMessage="Drop files or click here"
                      handleOnDrop={handleDropMusic}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your tune&apos;s mp3 / wav file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Upload</Button>
          </div>
          <div>
            <div className="mb-3 text-center font-semibold tracking-tight text-neutral-500">
              Tune preview
            </div>
            <SongCard
              albumCover={
                artworkFile
                  ? artworkFile
                  : "https://picsum.photos/seed/asdf/200/300"
              }
              {...{
                songName: fields.title || "Title",
                artistName: "Lucid Waves",
                price: String(fields.price),
                createdAt: new Date(),
              }}
            />
          </div>
        </div>
      </Form>
    </form>
  );
};
