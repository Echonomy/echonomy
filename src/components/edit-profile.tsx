import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAccountClient } from "~/components/safe-account-provider";
import { z } from "zod";
import { api } from "~/utils/trpc";
import Dropzone from "~/components/ui/dropzone";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, FormField, FormLabel, FormControl, FormDescription, FormMessage, FormItem } from "~/components/ui/form";
import { SongCard } from "./song-card";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  bio: z.string(),
  price: z.number().min(0, {
    message: "Price must be at least 0 USDC.",
  }),
  artwork: z.string(),
});

export const EditProfileForm = () => {
  const safeAccountClient = useSafeAccountClient();
  const [artworkFile, setArtworkFile] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
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
      form.setValue("artwork", null);
      form.setError("artwork", {
        message: "Artwork is required",
        type: "typeError",
      });
    }
  };

  const handleFormSubmit = async () => {
    // Submit the form data and artwork URL to save the metadata for the song
    const formData = form.getValues();
    await insertMetadataMutation.mutateAsync({
      songId: 123, // Replace with actual song ID
      name: formData.name,
      description: "Song description", // Replace with actual description
      artworkUploadId: formData.artwork,
      mediaUploadId: "mediaUploadId", // Replace with actual media upload ID
    });
  };

  return (
    <Form {...form} onSubmit={handleFormSubmit}>
      <div className="grid gap-12 md:grid-cols-4 pt-7">
        <div className="md:col-span-1"></div>
        <div className="space-y-4 md:col-span-2">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormDescription>Your artist / band / producer name that will be seen across the platform.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Input placeholder="Enter bio" {...field} />
                </FormControl>
                <FormDescription>Short biography about yourself as an artist.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <FormControl>
                  {/* <Input type="file" {...field} /> */}
                  <Dropzone
                    {...field}
                    dropMessage="Drop files or click here"
                    handleOnDrop={handleDropArtwork}
                  />
                </FormControl>
                <FormDescription>
                  Upload a profile picture that best represents you as an artist.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Save</Button>
          <div className="text-xs text-neutral-700 text-center pt-10">
            <span className="font-bold">Your Safe Account:</span>{" "}
            {safeAccountClient?.account?.address}
          </div>
        </div>
        <div className="md:col-span-1"></div>
      </div>
    </Form>
  );
};

