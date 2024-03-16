// import { FormField, FormLabel, FormControl, Input, FormDescription, FormMessage, Button } from "~/components/ui";
import { Form, FormField, FormLabel, FormControl, FormDescription, FormMessage, FormItem } from "~/components/ui/form"
import { Input } from "~/components/ui/Input"
import { Button } from "~/components/ui/Button"
import Dropzone from "~/components/ui/Dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { SongCard } from "./song-card"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  price: z.number().min(0, {
    message: "Price must be at least 0.1 USDC.",
  }),
})

export const CreateSongForm = () => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Title",
      price: 0
    },
  })

  const fields = form.watch();

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>

      <div className="text-md font-semibold tracking-tight text-2xl my-4 mt-10">
        Create a new Tune
      </div>
      <div className="grid md:grid-cols-3 gap-12">
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
          < FormField

            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter price" {...field} />
                </FormControl>
                <FormDescription>Enter the price you want users to pay for this tune in USDC.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          < FormField

            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File</FormLabel>
                <FormControl>
                  {/* <Input type="file" {...field} /> */}
                  <Dropzone
                    {...field}
                    dropMessage="Drop files or click here"
                    handleOnDrop={() => null}
                  />
                </FormControl>
                <FormDescription>Upload your tune file.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit"> Upload</Button>
        </div>
        <div>
          <div className="font-semibold tracking-tight text-neutral-500 mb-3 text-center">
            Tune preview
          </div>
          <SongCard {...{ songName: fields.title || "Title", artistName: "Lucid Waves", albumCover: "https://picsum.photos/seed/asdf/200/300", price: fields.price, createdAt: "April 1, 2023" }} />
        </div>
      </div>
    </Form>
  );
};