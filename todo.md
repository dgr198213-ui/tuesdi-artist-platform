# Tuesdi Artist Platform - TODO

## Stack Tecnológico (confirmado)

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Wouter
- **Backend/Base de Datos:** Supabase (PostgreSQL, Auth)
- **Autenticación:** Magic Link (Supabase `signInWithOtp` + HMAC-SHA256 en edge function)
- **Despliegue:** Vercel
- **Testing:** Vitest

## Estructura de Base de Datos

- [x] Tabla de artistas (`artists`)
- [x] Tabla de eventos (`events`)
- [x] Tabla de consultas/contactos (`inquiries`)
- [x] Tabla de planes de suscripción (`subscription_plans`)
- [x] Tabla de estadísticas de artista (`artist_stats`)

## Autenticación

- [x] Magic Link vía Supabase (signInWithOtp)
- [x] `emailRedirectTo` hardcoded a URL de producción (evita rechazo de Supabase en previews de Vercel)
- [x] Edge function con generación de token HMAC-SHA256
- [x] Reemplazo del flujo inseguro anterior (`btoa()` client-side)

## Sistema de Diseño (Stitch v3.0 "Digital Stage")

- [x] Integración UI en 17+ pantallas
- [x] Tema dark coherente en Tailwind
- [x] Componentes base reutilizables

## Páginas y Flujos Principales

- [x] Home (hero, buscador, eventos y artistas destacados)
- [x] Explorar Artistas (filtros por categoría, ciudad, búsqueda, paginación)
- [x] Catálogo de Eventos (filtros por categoría, fecha, ubicación, búsqueda, paginación)
- [x] Perfil de Artista (bio, galería, videos, redes, eventos, contacto)
- [x] Detalle de Evento
- [x] Publicar Evento (formulario multi-paso)
- [x] Planes y Precios (Beta gratis / Standard / Pro "Próximamente")
- [x] Dashboard del artista (estadísticas, eventos, consultas, perfil)
- [x] Landing de campaña Beta (`/escaparate`)

## 🔴 Pendiente Activo (Fase 2 — Error Handling)

- [ ] Estados de `fetchError` en componentes de datos
- [ ] Distinción entre error de conexión vs. recurso no encontrado (404)
- [ ] `try/catch` en la carga del Dashboard

## Mantenimiento / Deuda Técnica

- [ ] Reconciliar cambios automáticos del agente Manus (IDs de Stripe hardcodeados, conflictos de esquema, modificaciones a Magic Link) antes de cada merge a `main`
- [ ] Mantener este archivo como fuente de verdad única — eliminar referencias a stacks descartados (Express/tRPC/Drizzle/MySQL/Manus OAuth no forman parte de esta arquitectura)

## ESTADO ACTUAL: 🟡 BETA ABIERTA — EN DESARROLLO ACTIVO

No es un proyecto "completado": está en validación con artistas reales antes de activar planes de pago (objetivo ~25-30 artistas activos). Próximo hito: cerrar Fase 2 de manejo de errores.
