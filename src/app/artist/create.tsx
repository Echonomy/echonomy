import { useForm, FormField } from "@shadcn/form";
import { Input } from "@shadcn/input";


export function CreateSong() {
  interface FormValues {
    songName: string;
    artistName: string;
    albumCover: string;
    price: string;
    createdAt: string;
  }

  const form = useForm();

  const handleSubmit = (values) => {
    console.log(values);
    // Add your submission logic here
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 bg-neutral-800 p-4 rounded-lg">
      <FormField
        control={form.control}
        name="songName"
        render={({ field }) => <Input placeholder="Song Name" {...field} />}
      />
      <FormField
        control={form.control}
        name="artistName"
        render={({ field }) => <Input placeholder="Artist Name" {...field} />}
      />
      <FormField
        control={form.control}
        name="albumCover"
        render={({ field }) => <Input placeholder="Album Cover URL" {...field} />}
      />
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => <Input placeholder="Price" {...field} />}
      />
      <FormField
        control={form.control}
        name="createdAt"
        render={({ field }) => <Input type="date" placeholder="Creation Date" {...field} />}
      />
      <button type="submit" className="btn">
        Create Song
      </button>
    </form>
  );
}