# TUESDI — Tu Escenario Digital.

*Tu escaparate digital para artistas.**  
Muestra tu talento, aumenta tu visibilidad y recibe solicitudes de contacto sin exponer tus datos personales.

🌐 **Producción:** [tuesdi.com](https://tuesdi.com) · [tuesdi-artist-platform.vercel.app](https://tuesdi-artist-platform.vercel.app)  
📦 **Repositorio:** [github.com/dgr198213-ui/tuesdi-artist-platform](https://github.com/dgr198213-ui/tuesdi-artist-platform)

---

## Estado del Proyecto

**Fase actual:** Beta Abierta (acceso completo gratuito) · En producción.

| Área | Estado |
|------|--------|
| **Dominio propio** | ✅ `tuesdi.com` con SSL (Vercel) |
| **Correo** | ✅ Envío vía Resend (`noreply@tuesdi.com`) · Buzón `hola@tuesdi.com` (Nominalia) |
| **Autenticación** | ✅ Magic Link (HMAC-SHA256, sin contraseñas) |
| **Publicación de eventos** | ✅ Flujo anónimo completo (crear → email → confirmar → publicar) |
| **Perfiles de artista** | ✅ Editor, multimedia, analítica, bandeja de solicitudes |
| **Panel admin** (`/system`) | ✅ Gestión completa: eventos (crear/editar/aprobar/borrar, con foto) y artistas |
| **CI/CD** | ✅ GitHub Actions + branch protection en `main` |
| **Seguridad** | ✅ 4 críticos de auditoría cerrados (phishing, rate limiting, stack traces, fuga de emails) |
| **Rendimiento** | ✅ Imágenes optimizadas (−96%, dist ~1.8 MB) |
| **Testing** | ✅ 69 tests (incl. HMAC/expiración de magic links en `_shared/magic-token`) |
| **Migraciones** | ✅ Repo ↔ BD sincronizados (21 = 21) |
| **Planes** | ✅ Preparados: límites aplicados en BD, vídeo nativo (≤100 MB) + enlaces, poda automática en downgrade, cláusula en Términos. Falta solo Stripe live |
| **Pagos (Stripe)** | ⏳ Integrado en modo test, sin activar |

*Última auditoría completa: 05-jul-2026 — tsc limpio · 69/69 tests · build OK · RLS verificado (anon solo ve contenido aprobado).*

### Pendiente
- Reducir el bundle `vendor` (~610 KB) con code-splitting (recharts + supabase-js).
- Activar Stripe (precios reales) cuando se decida monetizar.

### Norma de trabajo con la base de datos
Los cambios de esquema se escriben **primero como archivo de migración** en `supabase/migrations/` (con timestamp) y se aplican desde ahí. Evita la desincronización repo ↔ BD que da error en el check de Supabase Preview.

> ⚠️ Un agente automatizado (Manus) tiene acceso de colaborador al repo. Revisar cada uno de sus commits antes de aceptarlos; el CI actúa como primera barrera.

---

## ¿Qué es TUESDI?

TUESDI es una plataforma de **visibilidad artística** diseñada para que los artistas dispongan de un perfil profesional público donde mostrar su trabajo y recibir solicitudes de contacto de forma privada y segura.

Paralelamente ofrece un **directorio público de eventos culturales y artísticos**.

### TUESDI es:
- Un escaparate digital
- Un directorio de artistas
- Un directorio de eventos
- Una plataforma de visibilidad
- Un sistema de descubrimiento de talento

### TUESDI NO es:
- Una agencia artística ni marketplace
- Una plataforma de reservas o contratación
- Un gestor de pagos ni intermediario comercial
- Una red social ni sistema de mensajería

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + Vite | React 19.2, Vite 7.1 |
| Estilos | Tailwind CSS v4 | 4.1.14 |
| Routing | Wouter | 3.3.5 |
| Backend / DB | Supabase | supabase-js 2.108 |
| Email | Resend | via Edge Functions |
| Hosting | Vercel | — |
| Control de versiones | GitHub | — |
| Fuentes | Montserrat + Inter + Material Symbols | Google Fonts |

---

## Arquitectura del Proyecto

```
tuesdi-artist-platform/
├── client/
│   ├── index.html                    # Fuentes Google Fonts + Material Symbols
│   └── src/
│       ├── App.tsx                   # Enrutador principal (wouter Switch)
│       ├── index.css                 # Sistema de diseño Stitch v3.0 (tokens M3)
│       ├── lib/
│       │   └── supabase.ts           # Cliente Supabase
│       ├── components/
│       │   ├── DashboardShell.tsx    # Layout sidebar + topbar del panel privado
│       │   ├── ProtectedRoute.tsx    # HOC de rutas autenticadas
│       │   ├── ErrorBoundary.tsx
│       │   └── ui/                   # Componentes shadcn/ui
│       └── pages/
│           ├── Home.tsx              # Portada principal
│           ├── Acceso.tsx            # Login/Registro via Magic Link
│           ├── EnlaceEnviado.tsx     # Confirmación de envío del Magic Link
│           ├── ExplorarArtistas.tsx  # Directorio de artistas con filtros
│           ├── ArtistaProfile.tsx    # Perfil público individual (/artista/:slug)
│           ├── Eventos.tsx           # Directorio de eventos con filtros
│           ├── EventoDetalle.tsx     # Detalle de evento (/eventos/:id)
│           ├── PublicarEvento.tsx    # Formulario anónimo de publicación
│           ├── ExitoPublicacion.tsx  # Confirmación pendiente (Magic Link enviado)
│           ├── ConfirmarEvento.tsx   # Validación del token (/confirmar-evento/:token)
│           ├── Precios.tsx           # Planes Beta / Standard / Pro
│           ├── Dashboard.tsx         # Overview del panel privado
│           ├── EditorPerfil.tsx      # Editor de perfil artístico
│           ├── BandejaContactos.tsx  # Solicitudes de contacto recibidas
│           ├── GestionMedia.tsx      # Galería multimedia (fotos + vídeos)
│           ├── Analitica.tsx         # Métricas de rendimiento del perfil
│           ├── Contacto.tsx          # Formulario de contacto con TUESDI
│           ├── QuienesSomos.tsx      # Página informativa
│           ├── AvisoLegal.tsx
│           ├── PoliticaPrivacidad.tsx
│           ├── PoliticaCookies.tsx
│           └── TerminosServicio.tsx
├── supabase/
│   ├── functions/
│   │   ├── create-magic-link/        # Genera y envía Magic Link HMAC-SHA256 via Resend
│   │   ├── confirm-event/            # Valida token y aprueba el evento (status → approved)
│   │   └── send-welcome-email/       # Email de bienvenida via Resend
│   └── migrations/
│       ├── 001_inicial_tuesdi.sql    # Esquema principal v3.0.1
│       ├── 002_editor_perfil.sql     # Bucket artist-media + políticas storage
│       └── 20260524112351.sql        # Roles, profiles, handle_new_user
├── supabase_setup_completo.sql       # Script de alineación de esquema (BDs existentes)
├── tuesdi_fix_completo.sql           # Script de corrección completa (idempotente)
└── vercel.json                       # SPA rewrite rule
```

---

## Rutas de la Aplicación

### Públicas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Portada con artistas destacados, eventos y planes |
| `/acceso` | Acceso | Login y registro via Magic Link (sin contraseñas) |
| `/enlace-enviado` | EnlaceEnviado | Confirmación de envío del Magic Link de acceso |
| `/artistas` | ExplorarArtistas | Directorio de artistas con búsqueda y filtros |
| `/artista/:slug` | ArtistaProfile | Perfil público del artista + formulario de contacto privado |
| `/eventos` | Eventos | Directorio de eventos culturales |
| `/eventos/:id` | EventoDetalle | Detalle del evento + contacto con organizador |
| `/publicar-evento` | PublicarEvento | Formulario anónimo de publicación de eventos |
| `/exito-publicacion` | ExitoPublicacion | Pantalla "pendiente de confirmación" |
| `/confirmar-evento/:token` | ConfirmarEvento | Validación del Magic Link de evento |
| `/planes` | Precios | Comparativa de planes Beta / Standard / Pro |
| `/quienes-somos` | QuienesSomos | Información sobre TUESDI |
| `/contacto` | Contacto | Formulario de contacto con el equipo |
| `/aviso-legal` | AvisoLegal | Aviso legal |
| `/politica-privacidad` | PoliticaPrivacidad | Política de privacidad |
| `/politica-cookies` | PoliticaCookies | Política de cookies |
| `/terminos-servicio` | TerminosServicio | Términos del servicio |

### Privadas (requieren sesión autenticada)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/dashboard` | Dashboard | Overview: métricas, actividad reciente, multimedia |
| `/dashboard/perfil` | EditorPerfil | Editor de perfil artístico + imágenes |
| `/dashboard/contactos` | BandejaContactos | Bandeja de solicitudes de contacto recibidas |
| `/dashboard/media` | GestionMedia | Galería de fotos y vídeos (límites por plan) |
| `/dashboard/analitica` | Analitica | Métricas de rendimiento y tasa de conversión |

---

## Base de Datos (Supabase)

### Tablas principales

**`artists`** — Perfiles de artistas  
`id, user_id, slug, artist_name, bio, category, city, country, starting_price, website, instagram, youtube, spotify, tiktok, profile_image, cover_image, subscription_plan, verified, created_at, updated_at`

**`contact_requests`** — Solicitudes de contacto (privadas)  
`id, artist_id, sender_name, sender_email, sender_phone, subject, message, status (new/read/archived), created_at, updated_at`

**`metrics`** — Métricas de visibilidad del artista  
`id, artist_id, profile_views, search_impressions, contact_clicks, contacts_received, recorded_at`

**`subscriptions`** — Suscripciones Stripe  
`id, artist_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, created_at`

**`media`** — Galería multimedia del artista  
`id, artist_id, type (photo/video), url, thumbnail, position, created_at`

**`events`** — Eventos culturales  
`id, title, description, category, city, country, event_date, event_time, image_url, organizer_name, organizer_email, status (pending/approved/rejected/expired), expires_at, created_at`

**`magic_links`** — Tokens HMAC-SHA256 para confirmación de eventos  
`id, event_id, token_hash, email, expires_at, used, created_at`

### Storage

**`artist-media`** — Bucket público para fotos de perfil, portadas y multimedia  
- Lectura pública
- Escritura de usuarios autenticados restringida a su carpeta propia (`<user_id>/...`)
- Escritura anónima permitida solo bajo el prefijo `events/...` (para que los promotores anónimos puedan adjuntar la imagen de su evento desde `/publicar-evento`)

---

## Edge Functions

### `create-magic-link`
Genera un token HMAC-SHA256 para confirmar la publicación de un evento y lo envía por email via **Resend**.

**Secrets requeridos:**
- `MAGIC_LINK_SECRET` — Clave secreta para firmar el token
- `RESEND_API_KEY` — Clave de la API de Resend
- `SITE_URL` — URL base de producción

### `confirm-event`
Valida el token HMAC recibido desde `/confirmar-evento/:token`, verifica que no haya sido usado ni caducado, y actualiza el evento a `status = "approved"`. Comparación en tiempo constante (`safeEqual`) y `verify_jwt: false` (el enlace se abre desde email sin sesión).

**Secrets requeridos:**
- `MAGIC_LINK_SECRET` — Debe ser idéntico al de `create-magic-link`

### `send-contact-email`
Procesa el formulario de contacto público. Honeypot anti-bot, rate limiting por IP, sanitización HTML. Entrega a `hola@tuesdi.com`.

### `send-welcome-email`
Email de bienvenida al registrarse un artista.

### `get-events` · `get-public-profile`
Lectura pública de eventos aprobados y perfiles de artista (para el directorio y las páginas públicas).

### `resend-email`
Reenvío del enlace de confirmación de evento.

> **Nota de seguridad:** `create-magic-link` usa **siempre** el `SITE_URL` de entorno para construir el enlace del email — nunca acepta una URL del cliente (previene phishing con la marca). Los errores internos se registran solo en `console.error`; al cliente se le devuelve un mensaje genérico. La creación de eventos está limitada por un trigger de BD (3/email/hora, 20 globales/hora).

---

## Flujos Principales

### Autenticación de Artistas (Magic Link)
```
Usuario → /acceso → supabase.auth.signInWithOtp({ email })
       → Email con enlace de Supabase Auth
       → Clic en enlace → sesión activa → /dashboard
```

### Publicación de Eventos (Anónima)
```
Organizador → /publicar-evento → INSERT events (status: pending)
           → invoke create-magic-link → Email con token HMAC
           → /exito-publicacion (pendiente de confirmación)
           → Clic en email → /confirmar-evento/:token
           → invoke confirm-event → status: approved
           → Evento visible en /eventos
```

### Contacto con Artistas (Privado)
```
Visitante → /artista/:slug → "Contactar Artista"
         → INSERT contact_requests (privado)
         → Artista ve el mensaje en /dashboard/contactos
         → Artista responde por email (sin intermediación)
```

---

## Variables de Entorno

### Vercel (variables de entorno del frontend)

```env
VITE_SUPABASE_URL=https://xseupkmaosjdrgdsdpmj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Supabase Edge Functions (secrets)

```
MAGIC_LINK_SECRET=<string aleatorio 32+ caracteres>
RESEND_API_KEY=re_...
SITE_URL=https://tuesdi-artist-platform.vercel.app
```

---

## Sistema de Diseño

TUESDI v3.0 usa el sistema de diseño **"Digital Stage"** creado con Stitch, basado en Material Design 3 con estética oscura, profesional e inspirada en escenarios en vivo.

### Colores de Marca
| Token | Color | Uso |
|-------|-------|-----|
| `primary` | `#0081FF` | Azul principal, botones CTA, acentos |
| `secondary` | `#00DBFF` | Azul Capri, elementos activos, neón |
| `background` | `#000000` | Fondo principal |
| `on-surface` | `#E2E2E2` | Texto principal |

### Tipografía
- **Montserrat** — Titulares (`font-headline-*`)
- **Inter** — Cuerpo de texto (`font-body-*`, `font-label-*`)
- **Material Symbols Outlined** — Iconografía

### Clases de Efecto Personalizadas
| Clase | Efecto |
|-------|--------|
| `.glass-card` | Glassmorphism con backdrop-blur y borde sutil |
| `.bloom-primary` | Resplandor azul (box-shadow) |
| `.neon-border` | Borde con brillo cian al hover |
| `.spotlight` | Gradiente radial de fondo |
| `.pulse-live` | Animación de pulso para indicadores "en vivo" |

---

## Planes de Suscripción

| Plan | Precio | Fotos | Vídeos | Métricas | Posicionamiento |
|------|--------|-------|--------|----------|-----------------|
| **Beta** | 0 €/mes | 1 | — | Básicas | Estándar |
| **Standard** | 6 €/mes | 3 | 1 | Ampliadas | Mejorado |
| **Pro** | 9,99 €/mes | 3 | 3 | Avanzadas + tendencias | Prioridad + distintivo Pro |

- **Vídeos:** subida **nativa** (MP4/WebM/MOV, máx. 100 MB, reproducidos dentro de TUESDI con `preload="none"`) o enlace de YouTube/Vimeo. Límites y dominios validados en la BD (trigger `check_media_plan_limit`).
- **Downgrade:** los planes tienen validez mensual; al bajar de plan (o cancelar → beta), el contenido sobrante se **elimina automáticamente** conservando los elementos más recientes (trigger `prune_media_on_plan_change`; recogido en Condiciones de Uso §6).
- La gestión de cobros se realizará vía **Stripe** (integrado en modo test, pendiente de activar en live). Especificación completa en `docs/TUESDI_planes_y_videos.md`.

---

## Configuración y Despliegue

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/dgr198213-ui/tuesdi-artist-platform.git
cd tuesdi-artist-platform
pnpm install
```

### 2. Variables de entorno locales

```bash
cp .env.example .env
# Edita .env con tus valores de Supabase
```

### 3. Ejecutar migraciones de base de datos

Ejecuta en **Supabase → SQL Editor** en este orden:
1. `supabase/migrations/001_inicial_tuesdi.sql`
2. `supabase/migrations/002_editor_perfil.sql`
3. `supabase_setup_completo.sql` (alineación adicional de esquema)

### 4. Desplegar Edge Functions

```bash
# Instala Supabase CLI si no lo tienes
npm install -g supabase

# Login y link al proyecto
supabase login
supabase link --project-ref xseupkmaosjdrgdsdpmj

# Configurar secrets
supabase secrets set MAGIC_LINK_SECRET=<tu-secreto>
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set SITE_URL=https://tuesdi-artist-platform.vercel.app

# Desplegar funciones
supabase functions deploy create-magic-link
supabase functions deploy confirm-event
```

### 5. Desarrollo local

```bash
pnpm dev
# Disponible en http://localhost:5173
```

### 6. Build de producción

```bash
pnpm build
```

---

## Principios Irrenunciables

- ✅ Sin exposición de datos personales del artista
- ✅ Sin chat interno — comunicación directa entre partes
- ✅ Sin pagos entre usuarios ni comisiones
- ✅ Sin intermediación en acuerdos
- ✅ Métricas reales — sin datos falsos
- ✅ Magic Link obligatorio para acceso y publicación de eventos
- ✅ Uso exclusivo para mayores de 18 años
- ✅ Artistas y eventos como ecosistemas separados
- ✅ El perfil artístico es el núcleo del producto

---

## Fases de Desarrollo

### Fase 1: Seguridad y Monetización ✅
- Corrección de políticas RLS para eventos pendientes
- Integración completa con Stripe (webhooks, sesiones de pago, componentes)
- Validación robusta de entrada en Edge Functions
- Sistema de suscripciones funcional

### Fase 2: Optimización de Escala ✅
- Optimización de imágenes (compresión en cliente, transformación en tiempo real)
- Estrategia de caché SWR en frontend
- Índices de base de datos para búsquedas ultra-rápidas
- Políticas de retención automática de datos
- Monitorización y alertas de costes

### Fase 3: Refinamiento de UX ✅
- Sistema de Skeleton Loaders para estados de carga
- Empty States ilustrados y contextuales
- Status Messages con animaciones
- Error Boundary mejorado con recuperación
- Accesibilidad WCAG AA completa
- Navegación móvil (Bottom Nav)
- Sistema de animaciones y transiciones

---

## Estado del Proyecto

**v3.0.4** — Fases 1-3 completadas. Optimización y refinamiento en producción.

| Módulo | Estado |
|--------|--------|
| Sistema de diseño Stitch "Digital Stage" | ✅ Integrado |
| Home | ✅ Integrado |
| Acceso / Magic Link de artistas | ✅ Integrado |
| Directorio de Artistas | ✅ Integrado |
| Perfil Público de Artista | ✅ Integrado |
| Directorio de Eventos | ✅ Integrado |
| Detalle de Evento | ✅ Integrado |
| Publicación de Eventos (Magic Link anónimo) | ✅ Integrado |
| Dashboard Overview | ✅ Integrado |
| Editor de Perfil | ✅ Integrado |
| Bandeja de Contactos | ✅ Integrado |
| Gestión Multimedia | ✅ Integrado |
| Analítica | ✅ Integrado |
| Páginas Legales | ✅ Integrado |
| Suscripciones Stripe | ✅ Fase 1 Completada |
| Optimización de Imágenes | ✅ Fase 2 Completada |
| Caché y Rendimiento BD | ✅ Fase 2 Completada |
| Accesibilidad (A11y) | ✅ Fase 3 Completada |
| Componentes de UX | ✅ Fase 3 Completada |
| Slug/rutas `/artistas` → `/explorar-artistas` | 🔜 Fase posterior |
| Verificación de artistas | 🔜 Fase posterior |
| Notificaciones de nuevos contactos | 🔜 Fase posterior |

---

## Autor

**Daniel García**  
Documento Maestro Oficial TUESDI v3.0 — Junio 2026

---

*TUESDI aspira a convertirse en el escaparate digital de referencia para artistas independientes y profesionales.*
