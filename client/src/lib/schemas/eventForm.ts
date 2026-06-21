import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200, "Máximo 200 caracteres"),
  description: z.string().max(2000, "Máximo 2000 caracteres").default(""),
  category: z.string().min(1, "Selecciona una categoría"),
  city: z.string().min(1, "La ciudad es obligatoria").max(100),
  country: z.string().default("España"),
  event_date: z.string().min(1, "La fecha es obligatoria"),
  event_time: z.string().default(""),
  organizer_name: z.string().default(""),
  organizer_email: z.string().email("Email no válido").min(1, "El email es obligatorio"),
});

export type EventForm = z.infer<typeof eventFormSchema>;