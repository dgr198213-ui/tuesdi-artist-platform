/**
 * contactFormSchema — Validación del formulario de contacto
 *
 * Schema de validación para el formulario de contacto.
 * Utilizado para asegurar la integridad de los datos de contacto.
 */
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  email: z.string().email("Email no válido").min(1, "El email es obligatorio"),
  subject: z.string().min(1, "El asunto es obligatorio").max(200),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000),
});

export type ContactForm = z.infer<typeof contactFormSchema>;