/**
 * contactFormSchema — Validación del formulario de contacto
 *
 * @todo (2026-06-19) — SCHEMA NO INTEGRADO EN TODAS LAS PÁGINAS
 * - Contacto.tsx: usa validación nativa HTML (`required`) sin Zod.
 * - ArtistaProfile.tsx: usa validación manual con toast.
 * Pendiente migrar ambas páginas a RHF + zodResolver para
 * consistencia con EditorPerfil.tsx y PublicarEvento.tsx.
 */
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  email: z.string().email("Email no válido").min(1, "El email es obligatorio"),
  subject: z.string().min(1, "El asunto es obligatorio").max(200),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000),
});

export type ContactForm = z.infer<typeof contactFormSchema>;