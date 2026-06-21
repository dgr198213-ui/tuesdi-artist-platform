# Edge Functions — Backlog

Estas funciones están **fuera del directorio activo** de despliegue porque no son invocadas por ningún componente del cliente ni por otras Edge Functions activas. Se conservan aquí para no perder el código, pero **no deben desplegarse** hasta que la funcionalidad correspondiente esté activa en el frontend.

| Función | Requiere secrets | Activar cuando... |
|---|---|---|
| `get-public-artists` | `SUPABASE_SERVICE_ROLE_KEY` | Se migre `ExplorarArtistas.tsx` de consulta directa a Edge Function (optimización futura) |
| `stripe-webhook` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Se active la monetización real con Stripe |
| `generate-image-thumbnail` | `SUPABASE_SERVICE_ROLE_KEY` | Se implemente generación automática de thumbnails en el flujo de subida de imágenes |
| `monitoring-and-alerts` | `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` | Se configure un cron job de monitoreo con usuarios reales en producción |

> La carpeta `_backlog` es ignorada por el CLI de Supabase al desplegar funciones
> (solo despliega directorios con un `index.ts` en la raíz de `functions/`).
