"use client";

import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormItem,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Dropzone from "~/components/ui/dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SongCard } from "./song-card";
import { api } from "~/utils/trpc";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  price: z.number().min(0, {
    message: "Price must be at least 0.1 USDC.",
  }),
  artwork: z.string(),
});

export const CreateSongForm = () => {
  const [insertMetadataData, setInsertMetadataData] = useState(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Title",
      price: 0,
    },
  });

  const insertMetadataMutation = api.media.insertMetadata.useMutation();
  const signedUrlQuery = api.media.signedUrl.useMutation();

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
        const x = await insertMetadataMutation.mutateAsync({
          uploadId: signedUrlQuery.data?.uploadId,
        });
        console.log({ x });
      }
    } else {
      form.setValue("artwork", null);
      form.setError("artwork", {
        message: "Artwork is required",
        type: "typeError",
      });
    }
  };

  return (
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
                <FormDescription>Enter the title of your tune.</FormDescription>
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
            name="file"
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
                  Upload your tune's artwork in an image file format.
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
            {...{
              songName: fields.title || "Title",
              artistName: "Lucid Waves",
              albumCover: "https://picsum.photos/seed/asdf/200/300",
              price: fields.price,
              createdAt: "April 1, 2023",
            }}
          />
        </div>
      </div>
    </Form>
  );
};
