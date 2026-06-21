# TUESDI — Tu Escenario Digital

*Tu escaparate digital para artistas.*
Muestra tu talento, aumenta tu visibilidad y recibe solicitudes de contacto sin exponer tus datos personales.

🌐 **Producción:** [tuesdi-artist-platform.vercel.app](https://tuesdi-artist-platform.vercel.app)
📦 **Repositorio:** [github.com/dgr198213-ui/tuesdi-artist-platform](https://github.com/dgr198213-ui/tuesdi-artist-platform)

> ⚠️ Este README refleja el estado **real y verificado** del código y la base de datos en producción (auditado directamente contra Supabase y GitHub, con build/tests/tsc ejecutados de verdad). Si algo aquí no coincide con lo que ves en el código, este documento es la fuente de verdad — actualízalo en el mismo commit que cambie la arquitectura. Ver también `docs/adr/` para decisiones documentadas.

---

## ¿Qué es TUESDI?

TUESDI es una plataforma de **visibilidad artística** diseñada para que los artistas dispongan de un perfil profesional público donde mostrar su trabajo y recibir solicitudes de contacto de forma privada y segura. Paralelamente ofrece un **directorio público de eventos culturales**, abierto a cualquiera (sin necesidad de cuenta).

### TUESDI es:
- Un escaparate digital para artistas
- Un directorio de eventos culturales
- Un sistema de descubrimiento de talento

### TUESDI NO es:
- Una agencia artística ni marketplace
- Una plataforma de reservas o contratación
- Una red social ni sistema de mensajería pública

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 7 |
| Estilos | Tailwind CSS v4 |
| Routing | Wouter |
| Backend / DB | Supabase (PostgreSQL + Auth + Edge Functions) |
| Tipos | `client/src/lib/database.types.ts`, generado desde el esquema real (ver ADR 001) |
| Email transaccional | Resend |
| Pagos | Stripe (parcialmente integrado, ver estado abajo) |
| Hosting | Vercel |
| CI | GitHub Actions (`pnpm check` + `test` + `build` en cada push/PR a `main`) |
| Gestor de paquetes | pnpm |

---

## Base de Datos (Supabase — esquema real verificado, tipos generados)

**`profiles`** — Perfil de artista. `profiles.id` ES `auth.users.id` (no hay tabla `artists` separada; nunca ha existido).
`id, slug, display_name, category (enum artist_category), city, country, bio, avatar_url, cover_url, price_from (numeric), price_note (text libre), instagram, youtube, spotify, website, rating, reviews_count, plan (enum artist_plan: spark/spotlight/headliner), is_published, requirements, organizer_name, organizer_email, organizer_phone, organizer_company, organizer_website, created_at, updated_at`

**`user_roles`** — `id, user_id, role (enum app_role: admin/artist/organizer), created_at`

**`media`** — Galería del perfil. Relación por `user_id`, no `artist_id`.
`id, user_id, type (enum media_type: image/video), url, storage_path, duration_seconds, position, created_at`

**`events`** — Eventos culturales. Publicación anónima (Opción C).
`id, organizer_id (nullable, FK auth.users), title, description, category (enum artist_category), date (timestamptz), location, city, budget_min, budget_max, image_url, is_published, organizer_email, verification_token_hash, verification_expires_at, created_at, updated_at`

**`event_submission_log`** — Rate limiting compartido (eventos y contacto a artistas) por IP/email.
`id, ip, email, created_at`

**`favorites`** — `id, user_id, artist_id, created_at`

**`subscriptions`** — Suscripciones Stripe. Relación por `user_id`, no `artist_id`.
`id, user_id, stripe_customer_id, stripe_subscription_id, plan (enum artist_plan), status, current_period_start, current_period_end, cancel_at, created_at, updated_at`

**`messages`** — Mensajería interna + contacto anónimo a artistas.
`id, sender_id (nullable — null cuando es un visitante anónimo vía contact-artist), recipient_id, sender_name, sender_email, subject, body, is_read, created_at`

### Enums Postgres
- `artist_category`: musica, teatro, magia, comedia, danza, dj, circo, arte, foto_video
- `artist_plan`: spark, spotlight, headliner *(el resto del código usa beta/standard/pro — ver `PLAN_DB_VALUE`/`PLAN_UI_VALUE` en `constants.ts`)*
- `app_role`: admin, artist, organizer
- `media_type`: image, video

⚠️ Las etiquetas de categoría en español de la UI (`"Música"`, `"Cantante"`...) **no coinciden** con los valores del enum. Usar siempre `CATEGORY_DB_VALUE` (`constants.ts`) antes de mandar `category` a Supabase.

### Storage
**`artist-media`** — Bucket público para fotos/vídeos de perfil y eventos.

### Regenerar tipos tras cualquier migración
```bash
npx supabase gen types typescript --project-id nbhaacqjqhpofuvfztkz --schema public > client/src/lib/database.types.ts
```
Sin esto, `pnpm check` no detectará referencias a columnas que ya no existen.

---

## Edge Functions

| Función | Estado | Propósito |
|---|---|---|
| `submit-event` | ✅ Activa | Publicar evento sin cuenta (honeypot + rate limit 5/IP/día, 10/email/mes), crea evento `is_published:false` + token hasheado, envía email de verificación |
| `verify-event` | ✅ Activa | Valida `/confirmar-evento/:token` (formato `eventId.random`) y publica el evento |
| `contact-artist` | ✅ Activa | Formulario "Contactar Artista" sin cuenta (honeypot + rate limit 10/IP/día, 5/email/día), inserta en `messages` y notifica al artista por email |
| `get-public-profile` | ✅ Activa | Perfil público de artista por `slug` + media + relacionados |
| `get-events` | ✅ Activa | Lista eventos publicados con filtros (búsqueda, categoría, ciudad) |
| `send-contact-email` | ✅ Activa | Formulario de contacto general del sitio (`/contacto`, no por artista) |
| `send-welcome-email` | ✅ Activa | Email de bienvenida tras el primer acceso |
| `create-checkout-session` | ✅ Activa, **UI no enrutada** | Stripe Checkout. Lista para activar (`SubscriptionPlans.tsx`/`useStripeCheckout.ts` marcados `@backlog`) |

`supabase/functions/_backlog/` — funciones retiradas: `create-magic-link`, `confirm-event` (sistema anterior, dependía de tabla `magic_links` que nunca existió; reemplazado por `submit-event`/`verify-event`).

**Secrets requeridos** (Supabase Dashboard → Edge Functions → Secrets):
```
RESEND_API_KEY=re_...
SITE_URL=https://tuesdi-artist-platform.vercel.app
STRIPE_SECRET_KEY=sk_test_... (solo para create-checkout-session)
```

---

## Flujos Principales

### Autenticación (Magic Link nativo de Supabase, mismo flujo para alta y vuelta a entrar)
```
Usuario → /acceso → supabase.auth.signInWithOtp({ email })
       → Si el email no existe: Supabase lo crea automáticamente
         (trigger on_auth_user_created → handle_new_user() crea profiles + user_roles)
       → Si ya existe: inicia sesión sin duplicar nada
       → emailRedirectTo FIJO a producción (no window.location.origin, ver Notas de Arquitectura)
       → Clic en email → sesión activa → /dashboard
       → Si ya hay sesión activa y se visita /acceso, redirige solo a /dashboard
```

### Publicación de Eventos — "Opción C" (sin cuenta, con validación por email)
```
Organizador → /publicar-evento → invoke submit-event
   → INSERT events (is_published: false) + token hasheado (SHA-256, formato eventId.random)
   → Email con enlace /confirmar-evento/:token
   → Clic → invoke verify-event → is_published: true → visible en /eventos
```

### Contacto con Artistas — mismo patrón (sin cuenta, con safeguards)
```
Visitante → /artista/:slug → invoke contact-artist
   → INSERT messages (sender_id: null, sender_name/email del visitante)
   → Notificación por email al artista (best-effort)
   → Artista lo ve en /dashboard/contactos (RLS: solo recipient_id = auth.uid())
```

---

## Notas de Arquitectura (decisiones deliberadas — no revertir sin leer esto)

- **No existe tabla `artists`.** Nunca ha existido. El perfil del artista vive en `profiles`, y `profiles.id = auth.users.id` directamente. El cliente de Supabase está tipado (`createClient<Database>`) precisamente para que esto no vuelva a pasar desapercibido — confía en los errores de `pnpm check`, no en memoria.
- **`emailRedirectTo` en `Acceso.tsx` está hardcoded a la URL de producción**, no a `window.location.origin`. Cada deploy de Vercel genera una URL de preview aleatoria que no está en la whitelist de Supabase Auth; usar el origin dinámico rompe el login en cualquier preview.
- **Eventos y contacto a artistas no requieren cuenta** (`events.organizer_id` y `messages.sender_id` son nullable a propósito). No reintroducir login obligatorio en estos flujos sin discutirlo — es una decisión de producto explícita.
- **Las categorías de la UI no son los valores del enum.** Usar siempre `CATEGORY_DB_VALUE`.
- **No hay tabla de métricas históricas real** (`profile_views`, `search_impressions`...). `Analitica.tsx`/`Dashboard.tsx` dejan esos datos vacíos deliberadamente en vez de inventarlos.

---

## Estado del Proyecto (verificado con build real, no aspiracional)

| Módulo | Estado |
|---|---|
| Login Magic Link (Supabase nativo) | ✅ Funcional |
| Registro de perfil de artista (`/dashboard/perfil`) | ✅ Funcional (corregido — antes ningún artista podía guardar) |
| Directorio de Artistas / Perfil público | ✅ Funcional |
| Directorio de Eventos | ✅ Funcional |
| Publicación de Eventos (Opción C) | ✅ Funcional |
| Contactar Artista (sin cuenta) | ✅ Funcional |
| Dashboard / Multimedia / Bandeja de contactos | ✅ Funcional |
| Analítica | 🟡 Funcional pero sin histórico real (no hay tabla de métricas) |
| Suscripciones Stripe | 🟡 Backend listo, **UI no enrutada** — pendiente activar monetización. Precios de test en Stripe (9.99€/19.99€) no coinciden con los planeados (6€/9.99€) |
| Roles (admin/artist/organizer) | 🟡 Tabla y enum existen, sin UI de gestión |
| Favoritos | 🟡 Tabla existe, sin UI |
| CI (GitHub Actions) | ✅ Activo desde 21 jun 2026 |

---

## Configuración y Despliegue

### 1. Clonar e instalar
```bash
git clone https://github.com/dgr198213-ui/tuesdi-artist-platform.git
cd tuesdi-artist-platform
pnpm install
```

### 2. Variables de entorno (Vercel / `.env` local)
```env
VITE_SUPABASE_URL=https://nbhaacqjqhpofuvfztkz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Edge Functions
```bash
supabase link --project-ref nbhaacqjqhpofuvfztkz
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set SITE_URL=https://tuesdi-artist-platform.vercel.app

supabase functions deploy submit-event verify-event contact-artist \
  get-public-profile get-events send-contact-email send-welcome-email create-checkout-session
```

### 4. Desarrollo local y validación
```bash
pnpm dev      # http://localhost:5173
pnpm check    # tsc --noEmit
pnpm test     # vitest run
pnpm build    # build de producción
```
Estos 3 últimos comandos son los que corre CI en cada push — ejecútalos localmente antes de pushear si haces cambios manuales.

### 5. Pendiente de configuración manual (Supabase Dashboard)
- **Authentication → URL Configuration → Redirect URLs**: añadir `https://tuesdi-artist-platform.vercel.app/**`
- **Authentication → Settings**: activar "Leaked password protection"
- Verificar que `RESEND_API_KEY` y `SITE_URL` están en Edge Functions → Secrets

---

## Principios Irrenunciables

- ✅ Sin exposición de datos personales del artista
- ✅ Sin pagos entre usuarios ni comisiones sobre contratos
- ✅ Sin intermediación en acuerdos entre artista y promotor
- ✅ Publicación de eventos y contacto sin fricción: sin cuenta, sin panel, solo email
- ✅ Métricas reales — nunca datos simulados en producción
- ✅ Uso exclusivo para mayores de 18 años

---

## Autor

**Daniel García**
README actualizado tras auditoría técnica completa + tipado generado + CI — 21 junio 2026
