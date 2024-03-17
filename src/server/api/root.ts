import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { songsRouter } from "./routers/songs";
import { artistsRouter } from "./routers/artists";
import { uploadsRouter } from "./routers/uploads";
import { fanTokensRouter } from "./routers/fanTokens";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  artists: artistsRouter,
  songs: songsRouter,
  uploads: uploadsRouter,
  fanTokens: fanTokensRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
