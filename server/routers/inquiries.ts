import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createInquiry, listInquiriesByArtist, getArtistByUserId } from "../db";

export const inquiriesRouter = router({
  // Create inquiry (public)
  create: publicProcedure
    .input(
      z.object({
        artistId: z.number(),
        eventId: z.number().optional(),
        senderName: z.string().min(1),
        senderEmail: z.string().email(),
        senderPhone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await createInquiry({
        ...input,
        status: "pending",
      });
    }),

  // List inquiries for current user's artist profile (protected)
  listMy: protectedProcedure.query(async ({ ctx }) => {
    const artist = await getArtistByUserId(ctx.user.id);
    if (!artist) return [];
    return await listInquiriesByArtist(artist.id);
  }),
});
