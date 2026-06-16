# TUESDI v3.0 — Estado Real del Proyecto

**Última actualización:** Junio 2026
**Ver documentación completa:** README.md

## Stack actual
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + Wouter 3.3.5
- Backend: Supabase (Auth Magic Link, PostgreSQL, Storage, Edge Functions)
- Hosting: Vercel
- Email: Resend
- Pagos: Stripe (pendiente — Fase posterior)

## Planes activos
| Plan | Precio | Estado |
|------|--------|--------|
| Beta | 0€/mes | ✅ Activo — acceso total durante Beta Abierta |
| Standard | 6€/mes | 🔜 Próximamente |
| Pro | 9,99€/mes | 🔜 Próximamente |

> No existe integración Stripe activa. Los planes de pago
> se muestran como "Próximamente" hasta que se active la monetización.

## Edge Functions desplegadas
- `create-magic-link` — Magic Link de confirmación de eventos (Resend)
- `confirm-event` — valida token HMAC y publica el evento
- `send-welcome-email` — email de bienvenida al primer login

## Migraciones de BD
- `001_inicial_tuesdi.sql` — esquema principal v3.0
- `002_editor_perfil.sql` — cover_image + bucket artist-media
- `20260524112351_user_roles_profiles.sql` — sync con estado remoto Supabase

## Notas eliminadas (no válidas)
- Precios Stripe hardcodeados (`price_1ThBhZ...`) — eliminados
- Referencias a Express/tRPC/MySQL — stack anterior, ya no existe
