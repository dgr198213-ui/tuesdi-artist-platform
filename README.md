# TUESDI — Tu Escenario Digital

*Tu escaparate digital para artistas.*
Muestra tu talento, aumenta tu visibilidad y recibe solicitudes de contacto sin exponer tus datos personales.

🌐 **Producción:** [tuesdi-artist-platform.vercel.app](https://tuesdi-artist-platform.vercel.app)
📦 **Repositorio:** [github.com/dgr198213-ui/tuesdi-artist-platform](https://github.com/dgr198213-ui/tuesdi-artist-platform)

> ⚠️ Este README refleja el estado **real y verificado** del código y la base de datos en producción (auditado directamente contra Supabase y GitHub). Si algo aquí no coincide con lo que ves en el código, este documento es la fuente de verdad — actualízalo en el mismo commit que cambie la arquitectura.

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
| Email transaccional | Resend |
| Pagos | Stripe (parcialmente integrado, ver estado abajo) |
| Hosting | Vercel |
| Gestor de paquetes | pnpm |

---

## Base de Datos (Supabase — esquema real verificado)

**`profiles`** — Perfil de artista. `profiles.id` ES `auth.users.id` (no hay tabla `artists` separada).
`id, slug, display_name, category (enum), city, bio, avatar_url, cover_url, price_from, rating, reviews_count, plan (enum: spark/spotlight/headliner), is_published, requirements, organizer_name, organizer_email, organizer_phone, organizer_company, organizer_website, created_at, updated_at`

**`user_roles`** — Rol del usuario. `id, user_id, role (enum: admin/artist/organizer), created_at`

**`media`** — Galería del perfil. Relación por `user_id`, no `artist_id`.
`id, user_id, type (enum: image/video), url, storage_path, duration_seconds, position, created_at`

**`events`** — Eventos culturales. Publicación anónima (Opción C, ver más abajo).
`id, organizer_id (nullable, FK auth.users), title, description, category (enum), date, location, city, budget_min, budget_max, image_url, is_published, organizer_email, verification_token_hash, verification_expires_at, created_at, updated_at`

**`event_submission_log`** — Rate limiting de publicación de eventos (por IP/email).
`id, ip, email, created_at`

**`favorites`** — `id, user_id, artist_id, created_at`

**`subscriptions`** — Suscripciones Stripe. Relación por `user_id`, no `artist_id`.
`id, user_id, stripe_customer_id, stripe_subscription_id, plan (enum), status, current_period_start, current_period_end, cancel_at, created_at, updated_at`

**`messages`** — `id, sender_id, recipient_id, subject, body, is_read, created_at`

### Storage
**`artist-media`** — Bucket público para fotos/vídeos de perfil y eventos.

---

## Edge Functions

| Función | Estado | Propósito |
|---|---|---|
| `submit-event` | ✅ Activa | Recibe el formulario de publicación de evento (honeypot + rate limiting + token de verificación), inserta el evento como no publicado y envía el email de confirmación |
| `verify-event` | ✅ Activa | Valida el token de `/confirmar-evento/:token` y publica el evento (`is_published: true`) |
| `get-public-profile` | ✅ Activa | Devuelve el perfil público de un artista por `slug` + su media + perfiles relacionados |
| `get-events` | ✅ Activa | Lista eventos publicados con filtros |
| `send-contact-email` | ✅ Activa | Envía el formulario de contacto general (con honeypot + rate limiting) |
| `send-welcome-email` | ✅ Activa | Email de bienvenida tras el primer acceso |
| `create-checkout-session` | ✅ Activa, pero **no enrutada en el frontend** | Crea sesión de Stripe Checkout. Lista para activar cuando se habilite la monetización (`SubscriptionPlans.tsx` / `useStripeCheckout.ts` están marcados `@backlog`) |

`supabase/functions/_backlog/` — funciones retiradas, no desplegadas: `create-magic-link`, `confirm-event` (sistema de confirmación anterior, dependía de una tabla `magic_links` que nunca existió en la BD real; reemplazado por `submit-event`/`verify-event`).

**Secrets requeridos** (Supabase Dashboard → Edge Functions → Secrets):
```
RESEND_API_KEY=re_...
SITE_URL=https://tuesdi-artist-platform.vercel.app
STRIPE_SECRET_KEY=sk_test_... (solo para create-checkout-session)
```

---

## Flujos Principales

### Autenticación de Artistas (Magic Link nativo de Supabase)
```
Usuario → /acceso → supabase.auth.signInWithOtp({ email })
       → Email con enlace de Supabase Auth (emailRedirectTo fijo a producción,
         NO window.location.origin — ver nota de arquitectura más abajo)
       → Clic en enlace → sesión activa → /dashboard
```

### Publicación de Eventos — "Opción C" (sin cuenta, con validación por email)

Decisión de producto: los eventos son gratuitos y efímeros, no justifican exigir
registro/login. Pero sí necesitamos trazabilidad para evitar spam.

```
Organizador → /publicar-evento → invoke submit-event
   (honeypot + rate limit 5/IP/día + 10/email/mes)
   → INSERT events (is_published: false) + token hasheado (SHA-256)
   → Email con enlace /confirmar-evento/:token (token = eventId.random)
   → Clic en email → invoke verify-event
   → is_published: true → evento visible en /eventos
```
Sin registro, sin perfil, sin panel — solo email + caducidad del token (24h).

### Contacto con Artistas (Privado)
```
Visitante → /artista/:slug → "Contactar Artista"
         → INSERT messages (privado)
         → Artista ve el mensaje en /dashboard/contactos
```

---

## Notas de Arquitectura (decisiones deliberadas — no revertir sin leer esto)

- **`emailRedirectTo` en `Acceso.tsx` está hardcoded a la URL de producción**, no a `window.location.origin`. Cada deploy de Vercel genera una URL de preview nueva y aleatoria que no estaría en la whitelist de Supabase Auth; usar el origin dinámico rompe el login en cualquier preview y requeriría mantener manualmente la whitelist en cada deploy. Si se necesita login funcional en previews, usar el alias de rama estable de Vercel (`*-git-<branch>-<team>.vercel.app`), no la URL única por deploy.
- **El esquema de BD no tiene tabla `artists`** — el perfil del artista vive en `profiles`, y `profiles.id = auth.users.id` directamente (no hay un `user_id` separado en `profiles`). Cualquier función o componente nuevo debe usar `profiles`, no `artists`.
- **Los eventos no requieren cuenta para publicarse** (`organizer_id` es nullable). No reintroducir un flujo de login obligatorio para `/publicar-evento` sin discutirlo antes — es una decisión de producto explícita, no un descuido.

---

## Estado del Proyecto (verificado, no aspiracional)

| Módulo | Estado |
|---|---|
| Login Magic Link (Supabase nativo) | ✅ Funcional |
| Directorio de Artistas / Perfil público | ✅ Funcional |
| Directorio de Eventos | ✅ Funcional |
| Publicación de Eventos (Opción C) | ✅ Funcional |
| Dashboard / Editor de perfil / Multimedia / Contactos | ✅ Funcional |
| Suscripciones Stripe | 🟡 Backend listo (`create-checkout-session`), **UI no enrutada** — pendiente de activar monetización |
| Roles (admin/artist/organizer) | 🟡 Tabla y enum existen, sin UI de gestión todavía |
| Favoritos | 🟡 Tabla existe, sin UI todavía |
| Mensajería interna (`messages`) | 🟡 Tabla existe; el contacto actual usa email directo, no mensajería in-app |

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
npm install -g supabase
supabase login
supabase link --project-ref nbhaacqjqhpofuvfztkz

supabase secrets set RESEND_API_KEY=re_...
supabase secrets set SITE_URL=https://tuesdi-artist-platform.vercel.app
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

supabase functions deploy submit-event
supabase functions deploy verify-event
supabase functions deploy get-public-profile
supabase functions deploy get-events
supabase functions deploy send-contact-email
supabase functions deploy send-welcome-email
supabase functions deploy create-checkout-session
```

### 4. Desarrollo local
```bash
pnpm dev   # http://localhost:5173
```

### 5. Migraciones
Las migraciones del repo (`supabase/migrations/`) documentan el historial de cambios, pero **la fuente de verdad del esquema en vivo es la propia base de datos** (consultar con `supabase migration list` o el dashboard, no asumir que el repo y la BD están sincronizados sin verificar).

---

## Principios Irrenunciables

- ✅ Sin exposición de datos personales del artista
- ✅ Sin pagos entre usuarios ni comisiones sobre contratos
- ✅ Sin intermediación en acuerdos entre artista y promotor
- ✅ Publicación de eventos sin fricción: sin cuenta, sin panel, solo email
- ✅ Métricas reales — nunca datos simulados en producción
- ✅ Uso exclusivo para mayores de 18 años

---

## Autor

**Daniel García**
README actualizado tras auditoría técnica completa — Junio 2026
