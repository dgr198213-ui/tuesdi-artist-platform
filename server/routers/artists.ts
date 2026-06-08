import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getArtistById, getArtistByUserId, listArtists, createArtist } from "../db";

export const artistsRouter = router({
  // Get artist by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getArtistById(input.id);
    }),

  // Get current user's artist profile (protected)
  getMe: protectedProcedure.query(async ({ ctx }) => {
    return await getArtistByUserId(ctx.user.id);
  }),

  // List all artists (public) with filters
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
        category: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let artists = await listArtists(input.limit, input.offset);

      // Apply filters
      if (input.category) {
        artists = artists.filter(
          (a) => a.category?.toLowerCase() === input.category?.toLowerCase()
        );
      }
      if (input.city) {
        artists = artists.filter(
          (a) => a.city?.toLowerCase() === input.city?.toLowerCase()
        );
      }
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        artists = artists.filter(
          (a) =>
            a.name.toLowerCase().includes(searchLower) ||
            a.bio?.toLowerCase().includes(searchLower)
        );
      }

      return artists;
    }),

  // Create artist profile (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        bio: z.string().optional(),
        genre: z.string().optional(),
        category: z.string().min(1),
        priceFrom: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        instagram: z.string().optional(),
        spotify: z.string().optional(),
        website: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createArtist({
        userId: ctx.user.id,
        ...input,
      });
    }),
});
