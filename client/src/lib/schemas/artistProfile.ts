import { z } from "zod";

const optionalUrl = z.string().url("URL no válida").optional().or(z.literal(""));

export const artistProfileSchema = z.object({
  artist_name: z.string().min(1, "El nombre artístico es obligatorio").max(100, "Máximo 100 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  city: z.string().min(1, "La ciudad es obligatoria").max(100),
  country: z.string().default("España"),
  bio: z.string().max(2000, "Máximo 2000 caracteres").default(""),
  starting_price: z.string().optional(),
  instagram: optionalUrl,
  youtube: optionalUrl,
  spotify: optionalUrl,
  website: optionalUrl,
  profile_image: z.string().default(""),
  cover_image: z.string().default(""),
});

export type ArtistProfileForm = z.infer<typeof artistProfileSchema>;