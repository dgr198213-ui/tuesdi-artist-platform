# TUESDI — Respuesta a incidentes

**Actualizado:** 9 de julio de 2026
**Contexto:** un solo desarrollador. No hay on-call, ni war room, ni canal de
Slack: los "stakeholders" eres tú y, si el incidente afecta a artistas, un
email desde `hola@tuesdi.com`.

Sustituye a `INCIDENT_RESPONSE.md` y `QUICK_REFERENCE.md`.

---

## Severidades

| Nivel | Qué significa | Objetivo de respuesta |
|---|---|---|
| **P1** | tuesdi.com caído o login roto para todos | Empezar en cuanto se detecte |
| **P2** | Una función clave degradada (publicar evento, magic link, media) | Mismo día |
| **P3** | Bug visible sin bloquear nada | Esta semana |
| **P4** | Cosmético | Backlog |

Enlaces a tener a mano:
- Vercel Deployments: https://vercel.com/dashboard → proyecto → Deployments
- Vercel Logs: proyecto → Logs
- Supabase Logs: https://supabase.com/dashboard/project/xseupkmaosjdrgdsdpmj/logs
- Estado de Vercel: https://www.vercel-status.com
- Estado de Supabase: https://status.supabase.com
- Estado de Resend: https://resend.com/status

---

## P1 — El sitio no carga / HTTP 500

1. **Confirmar** (30 s): abrir tuesdi.com en incógnito. Si carga para ti,
   puede ser problema del que reporta (su red, su caché).
2. **¿Es Vercel o Supabase?** Mirar las dos status pages de arriba. Si hay
   incidente de plataforma: no hay nada que desplegar, comunicar y esperar.
3. **¿Fue un deploy?** Vercel → Deployments. Si el último deploy coincide con
   el inicio del problema: **Promote to Production** sobre el deployment
   anterior. Recuperación en <1 min.
4. **Verificar**: tuesdi.com carga, `/acceso` envía email, un perfil de
   artista abre.
5. **Causa raíz después, no durante.** Con el sitio arriba, revisar Vercel
   Logs y el diff del deploy malo con calma. Anotar qué pasó al final de este
   archivo (historial de incidentes).

---

## P2 — Magic Link no funciona

Síntomas: no llega el email, o el enlace da "token inválido" / "caducado".

1. **Logs de la función**: Supabase → Functions → `create-magic-link` → Logs
   (últimos 30 min). Errores típicos:
   - `MAGIC_LINK_SECRET no está configurada` → Supabase → Edge Functions →
     Secrets: reponer el secret.
   - `Failed to send email via Resend` → comprobar `RESEND_API_KEY` y
     https://resend.com/status. En Resend → Logs se ve cada envío.
   - Nada en los logs → la función no se está invocando: revisar el frontend
     (Network tab al publicar un evento).
2. **Estado en BD** (SQL Editor):
   ```sql
   select id, event_id, created_at, expires_at, used,
          (expires_at < now()) as caducado
   from magic_links
   order by created_at desc
   limit 10;
   ```
   - Filas recientes con `caducado = true, used = false` → el organizador
     tardó más de la ventana de validez. Usar la función `resend-email` para
     regenerar el enlace, no tocar `expires_at` a mano (el token HMAC firma la
     expiración: alargar la fila en BD no revalida el token).
3. **¿Cambió el secret?** Si `MAGIC_LINK_SECRET` se rotó, **todos** los tokens
   emitidos antes son inválidos. Es el comportamiento esperado; los afectados
   necesitan un enlace nuevo. Por eso el secret solo se rota de forma
   deliberada (p. ej. tras una exposición), no rutinariamente.
4. **Prueba end-to-end**: publicar un evento real desde `/publicar-evento`
   con un email tuyo. No usar curl con la service key: la prueba válida es el
   flujo que usan los organizadores.

---

## P2 — Base de datos lenta (páginas tardan > 5 s)

1. **Identificar la query**: Supabase → Logs → Postgres, o:
   ```sql
   select query, calls, mean_exec_time
   from pg_stat_statements
   where mean_exec_time > 1000
   order by mean_exec_time desc
   limit 10;
   ```
2. **Ver el plan**: `explain analyze` sobre la query lenta. Si hay
   `Seq Scan` sobre `artists` o `events` filtrando por columna sin índice,
   crear el índice **como migración** (norma 4.1 de TUESDI.md), p. ej.:
   ```sql
   create index concurrently if not exists idx_events_status_date
     on events (status, event_date);
   ```
3. **Conexiones**: si el problema es intermitente,
   ```sql
   select count(*) from pg_stat_activity;
   ```
   El cliente usa supabase-js (PostgREST), así que el pool lo gestiona
   Supabase; un número alto sostenido apunta a plan insuficiente, no a un
   leak nuestro.
4. Si Supabase está degradado globalmente → status page y esperar.

---

## P2 — La subida de fotos/vídeos falla

1. Reproducir desde el dashboard de artista con una cuenta de prueba.
2. Errores típicos:
   - **413 / demasiado grande**: límite server-side de 100 MB por archivo en
     el bucket `artist-media`. Es intencional.
   - **RLS / 403**: el artista está intentando escribir fuera de su carpeta
     `<user_id>/...`, o la sesión caducó. Pedirle que vuelva a entrar.
   - **Trigger `check_media_plan_limit`**: el plan del artista no admite más
     media (Beta 1 foto/0 vídeos). No es un bug: es la política de planes.
3. Supabase → Storage → Logs para el detalle del rechazo.

---

## P3 — Errores puntuales en alguna página

1. Vercel → Logs, filtrar por `error`, últimos 30 min.
2. Si es un error de fetch a Supabase: el componente ya muestra
   `FetchErrorState` con retry (Fase 2). Verificar que efectivamente aparece,
   no una pantalla en blanco.
3. Reproducir en local con `pnpm dev`, corregir, PR con CI en verde.

---

## Después de cualquier P1/P2

- Anotar en la tabla de abajo: fecha, qué pasó, cuánto duró, qué se cambió.
- Si la causa fue un deploy: ¿por qué no lo cazó el CI? Añadir test si aplica.
- Si la detección fue por un usuario y no por una alerta: revisar §3 de
  `OPERACIONES.md` (monitorización).

## Historial de incidentes

| Fecha | Severidad | Qué pasó | Duración | Corrección |
|---|---|---|---|---|
| — | — | *(sin incidentes registrados hasta la fecha)* | — | — |

---

## Pendiente de añadir

- **Playbook de pagos (Stripe)**: se escribirá cuando Stripe pase a modo
  live. Documentar un runbook de pagos para una integración en modo test solo
  genera confusión.
