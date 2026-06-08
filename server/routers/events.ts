import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getEventById, listEvents, listEventsByArtist, createEvent } from "../db";
import { getArtistByUserId } from "../db";

export const eventsRouter = router({
  // Get event by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getEventById(input.id);
    }),

  // List all published events (public) with filters
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
        category: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let events = await listEvents(input.limit, input.offset);

      // Apply filters
      if (input.city) {
        events = events.filter(
          (e) => e.city?.toLowerCase() === input.city?.toLowerCase()
        );
      }
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(searchLower) ||
            e.description?.toLowerCase().includes(searchLower) ||
            e.venue?.toLowerCase().includes(searchLower)
        );
      }
      if (input.startDate) {
        events = events.filter((e) => e.eventDate >= input.startDate!);
      }
      if (input.endDate) {
        events = events.filter((e) => e.eventDate <= input.endDate!);
      }

      return events;
    }),

  // List events by current user's artist profile (protected)
  listMy: protectedProcedure.query(async ({ ctx }) => {
    const artist = await getArtistByUserId(ctx.user.id);
    if (!artist) return [];
    return await listEventsByArtist(artist.id);
  }),

  // Create event (protected)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventDate: z.string().min(1),
        eventTime: z.string().optional(),
        venue: z.string().min(1),
        city: z.string().min(1),
        country: z.string().min(1),
        price: z.string().optional(),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
        submitterName: z.string().optional(),
        imageUrl: z.string().optional(),
        ticketUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const artist = await getArtistByUserId(ctx.user.id);
      if (!artist) {
        throw new Error("Artist profile not found");
      }

      return await createEvent({
        artistId: artist.id,
        ...input,
        published: true,
      });
    }),
});
