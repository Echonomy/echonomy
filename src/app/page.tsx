"use client";


import { CreatePost } from "~/components/create-post";
import { api } from "~/utils/trpc";

export default function Home() {
  const { data: hello } = api.post.hello.useQuery({ text: "world" });

  return (
    <main className="flex flex-col items-center justify-center text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          IndieTunes
        </h1>
        <h3 className="-mt-8">
          a music distribution platform for independent artists, done right.
        </h3>
      </div>
    </main>
  );
}

function CrudShowcase() {
  const { data: latestPost } = api.post.getLatest.useQuery();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <CreatePost />
    </div>
  );
}