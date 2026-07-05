# TUESDI.md — Contexto maestro del proyecto

> Pega este archivo al inicio de cualquier chat nuevo para que Claude conozca el
> ADN, el stack, las normas y el estado de TUESDI sin reexplicarlo. Mantenlo
> actualizado cuando cambien decisiones importantes.

---

## 1. Qué es TUESDI

**TUESDI** ("Tu Escenario Digital") es una plataforma española de **visibilidad
para artistas independientes** y publicación de eventos culturales. Está **en
producción**, no es un proyecto nuevo: no hay que rediseñar su arquitectura,
sino mantenerla y mejorarla.

- **Producción:** https://tuesdi.com (y `tuesdi-artist-platform.vercel.app`)
- **Repo:** https://github.com/dgr198213-ui/tuesdi-artist-platform
- **Fase:** Beta Abierta (acceso completo gratuito).

### Filosofía (el ADN — no negociable)
1. **Control del artista:** el artista decide qué muestra, quién le contacta y si
   responde. Siempre.
2. **Privacidad por diseño:** el email y el teléfono nunca se muestran en público.
3. **Sin intermediación ni comisiones:** TUESDI facilita el primer contacto y se
   aparta. La negociación y el trabajo son directos entre las partes. No hay chat
   interno, no se procesan pagos entre usuarios, no se cobra porcentaje.

Cualquier funcionalidad o texto que contradiga estos tres principios está mal
por definición. El copy habla de "propuestas" y "solicitudes", no de
"contratación"; de "oportunidades reales", no de "popularidad".

---

## 2. Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 7 + TypeScript estricto |
| Estilos | Tailwind v4 |
| Routing | Wouter |
| Backend | Supabase (Postgres + Auth + Edge Functions + Storage) |
| Email | Resend (envío) + Nominalia (buzón `hola@tuesdi.com`) |
| Hosting | Vercel |
| Pagos | Stripe (integrado en modo test, sin activar) |
| Gestor paq. | **pnpm** (nunca npm — ver normas) |
| Tests | Vitest |

### Identificadores clave
- **Proyecto Supabase:** `xseupkmaosjdrgdsdpmj` (región eu-central-1)
- **Vercel:** teamId `team_JAdXWfQ7CTEn4X65PX7iNJ5E`, projectId `prj_fIUFO1Ey1MD4jiqEBE6vL1c7zj9v`
- **Resend:** dominio `tuesdi.com` verificado, envíos desde `noreply@tuesdi.com`, región eu-west-1

---

## 3. Arquitectura funcional

### Autenticación
Magic Link sin contraseñas (HMAC-SHA256). Los artistas entran por `/acceso` con
su email; Supabase Auth envía el enlace. **Site URL de Supabase Auth =
`https://tuesdi.com`** (si apunta a vercel.app, el login se rompe entre dominios).

### Publicación de eventos (flujo anónimo)
`/publicar-evento` → INSERT del evento en `pending` → `create-magic-link` envía
email con token HMAC → el organizador confirma en `/confirmar-evento/:token` →
`confirm-event` valida y pasa el evento a `approved`.

### Panel admin `/system`
Privado (solo `admin_users`). Gestión completa de eventos (crear/editar/
aprobar/rechazar/borrar, con foto) y artistas (ver/borrar). Si un no-admin entra,
va a `/404` sin revelar que la ruta existe.

### Edge Functions (Supabase)
`create-magic-link`, `confirm-event`, `send-contact-email`, `send-welcome-email`,
`get-events`, `get-public-profile`, `resend-email`. La lógica de firma/
verificación de tokens vive en `_shared/magic-token.ts` (con tests).

---

## 4. NORMAS DE TRABAJO (críticas — respétalas siempre)

### 4.1 Base de datos: migración primero
Todo cambio de esquema/RLS se escribe **primero como archivo** en
`supabase/migrations/` con el timestamp exacto que Supabase registra, y se
sincroniza en el mismo commit. Aplicar por MCP sin crear el archivo desincroniza
el repo y rompe el check "Supabase Preview" con *"Remote migration versions not
found"*. Si se aplica por MCP, crear el archivo con el nombre exacto de
`list_migrations` en el acto.

### 4.2 Bug conocido de RLS al insertar
No usar `.insert(...).select().single()` (INSERT...RETURNING) para filas que
nacen sin ser visibles bajo las políticas SELECT (ej. eventos `pending` sin
`artist_id`). Postgres rechaza por RLS. Solución: generar el `id` en cliente con
`crypto.randomUUID()` y no pedir RETURNING.

### 4.3 Storage
Bucket `artist-media`, público en lectura, **límite 100 MB/archivo (server-side)**.
Usuarios autenticados escriben en su carpeta `<user_id>/...` (fotos y vídeos
nativos en `<user_id>/videos/`); los promotores anónimos solo bajo `events/...`.

### 4.4 Git / despliegue
- Rama `main` con **branch protection** (exige el check de CI `build-and-test`).
- Flujo de push: clonar → editar → `pnpm build` (debe pasar) → commit → push.
- **CI** (GitHub Actions) corre `pnpm check` + `pnpm test` + `pnpm build` en cada
  push/PR. No mergear en rojo.
- Antes de cualquier commit: `pnpm check` y `pnpm build` limpios.

### 4.5 pnpm, no npm
El proyecto usa pnpm con `pnpm-lock.yaml` como única fuente de verdad. No generar
`package-lock.json`. Si se cambia una dependencia, regenerar el lockfile en el
mismo commit (evita `ERR_PNPM_OUTDATED_LOCKFILE`).

### 4.6 El agente Manus
Hay un agente colaborador (Manus) con acceso al repo con historial de conflictos
(force-push, cambió pnpm→npm, reintrodujo deps muertas). Revisar cada commit
suyo; el CI es la primera barrera.

### 4.7 Planes y media (decisiones de producto cerradas)
- Límites por plan (espejo en cliente y **trigger de BD** `check_media_plan_limit`):
  Beta 1 foto/0 vídeos · Standard 3/1 · Pro 3/3. Admins exentos.
- **Vídeo:** subida nativa (MP4/WebM/MOV, ≤100 MB, servido con `preload="none"`
  para no consumir egress hasta el play) **o** enlace YouTube/Vimeo. Ningún otro
  dominio se acepta (validado en el trigger).
- **Downgrade:** planes con validez mensual; al bajar de plan o cancelar (→ beta),
  el trigger `prune_media_on_plan_change` **elimina** el contenido sobrante
  conservando los elementos más recientes. Es definitivo y está en las
  Condiciones de Uso (§6). No cambiar sin decisión explícita de Dani.
- Especificación completa: `docs/TUESDI_planes_y_videos.md`.

---

## 5. Estándares de código y seguridad

- **TypeScript estricto**; `pnpm check` (tsc --noEmit) debe pasar siempre.
- **Nunca exponer detalles internos al cliente**: los `catch` de las Edge
  Functions registran el error real solo en `console.error`; al cliente,
  mensaje genérico ("Error interno").
- **Nunca aceptar URLs del cliente** para construir enlaces de email (riesgo de
  phishing): usar siempre la `SITE_URL` de entorno.
- **Rate limiting** de creación de eventos por trigger de BD (3/email/hora,
  20 globales/hora); los admins están exentos.
- **RLS**: verificar con `set role anon` que un anónimo solo ve contenido
  `approved` y nunca `magic_links`, `admin_users` ni emails de organizadores
  pendientes.
- **console.log** del frontend solo tras `import.meta.env.DEV`.
- **CSP**: `img-src` acotado (self, data, blob, `*.supabase.co`,
  `*.amazonaws.com`); no abrir a `https:`/`http:` genérico.
- **Copyright/identidad**: nombres de planes fijos (Beta / Standard / Pro), no
  renombrar.

---

## 6. Modelo de datos (resumen)

- **`events`**: id, title, description, category, city, country, event_date,
  event_time, image_url, organizer_name, organizer_email, status
  (pending/approved/expired/rejected), expires_at, artist_id (nullable).
- **`artists`**: id, user_id, slug, artist_name, bio, category, city, country,
  starting_price, redes, profile_image, cover_image, verified.
- **`magic_links`**: id, event_id, token_hash, email, expires_at, used.
- **`admin_users`**: user_id, role (owner).
- Otras: media, contact_requests, inquiries, subscriptions, event_submission_log,
  stripe_*.

---

## 7. Estado actual (actualizar al cambiar)

*Actualizado: 05-jul-2026.*

| Área | Estado |
|------|--------|
| Dominio + correo | ✅ end-to-end (`tuesdi.com`, `hola@tuesdi.com`) |
| Auth Magic Link | ✅ |
| Publicación de eventos (con foto) | ✅ |
| Panel `/system` | ✅ gestión completa |
| Seguridad | ✅ 4 críticos de auditoría cerrados |
| CI + branch protection | ✅ |
| Testing | ✅ 69 tests (incl. HMAC/expiración) |
| Migraciones repo↔BD | ✅ 21 = 21 |
| Rendimiento | ✅ imágenes −96%, dist ~1.8 MB |
| Planes | ✅ preparados: límites en BD, vídeo nativo ≤100 MB + enlaces, poda en downgrade, Términos §6 |
| Pagos Stripe | ⏳ modo test, sin activar |

### Pendiente
- Activar Stripe live + tabla visual de `/planes` según la spec.
- Code-splitting del bundle `vendor` (~610 KB): separar recharts + supabase-js.
- Vigilar egress de vídeo en Supabase (Dashboard → Usage) cuando haya uso real.

---

## 8. Cómo debe comportarse Claude en este proyecto

- Es un proyecto **en producción**: prioriza no romper nada. Verifica el estado
  real (BD, repo) antes de asumir; no apliques cambios "a ciegas".
- Sé claro con los **trade-offs** de cada decisión ("si eliges X, renuncias a Y").
- Verifica cada cambio: `pnpm check` + `pnpm build` + (si toca BD) prueba con
  `set role anon`.
- Respeta la filosofía del ADN (sección 1) en toda funcionalidad y copy.
- Ante cambios de BD, sigue la norma migración-primero (4.1).
- Si falta información crítica, pregunta antes de actuar.
