# Tuesdi Artist Platform - TODO

## Estructura de Base de Datos
- [x] Crear tabla de artistas (artists)
- [x] Crear tabla de eventos (events)
- [x] Crear tabla de consultas/contactos (inquiries)
- [x] Crear tabla de planes de suscripción (subscription_plans)
- [x] Crear tabla de estadísticas de artista (artist_stats)

## Autenticación y Contexto
- [ ] Implementar contexto de usuario autenticado
- [ ] Integrar con Manus OAuth
- [ ] Crear procedimientos tRPC para autenticación

## Sistema de Diseño (Tema Dark de Stitch)
- [x] Configurar colores del tema dark de Stitch en Tailwind
- [x] Crear componentes base reutilizables
- [x] Implementar sistema de tipografía consistente
- [x] Crear componentes de navegación

## Página de Inicio (Home)
- [x] Sección hero con buscador
- [x] Listado de eventos destacados
- [x] Catálogo de artistas destacados
- [x] Sección de características
- [x] Footer

## Autenticación
- [x] Pantalla de Login
- [x] Pantalla de Registro
- [x] Formularios con validación
- [x] Integración con OAuth

## Panel de Control del Artista (Dashboard)
- [x] Estadísticas principales (vistas, consultas, eventos)
- [x] Listado de eventos activos
- [x] Listado de consultas recibidas
- [x] Perfil del artista
- [ ] Editar perfil

## Explorar Artistas
- [x] Listado de artistas con tarjetas
- [x] Filtros por categoría
- [ ] Filtros por ciudad
- [ ] Búsqueda por nombre
- [ ] Paginación

## Catálogo de Eventos
- [x] Listado de eventos publicados
- [x] Filtros por categoría
- [ ] Filtros por fecha
- [ ] Filtros por ubicación
- [ ] Búsqueda por título
- [ ] Paginación

## Detalle de Evento
- [x] Página individual de evento
- [x] Información completa del evento
- [x] Datos del artista
- [x] Botón de contacto/compra de tickets
- [ ] Galería de imágenes

## Perfil de Artista
- [x] Página pública del artista
- [x] Bio y descripción
- [x] Galería de fotos
- [ ] Videos
- [x] Enlaces a redes sociales
- [x] Eventos del artista
- [x] Botón de contacto/consulta
- [ ] Sistema de consultas

## Publicar Evento (Formulario Multi-paso)
- [x] Paso 1: Información básica del evento
- [x] Paso 2: Detalles de ubicación
- [x] Paso 3: Información de contacto
- [x] Paso 4: Imagen del evento
- [x] Paso 5: Revisión y publicación
- [ ] Validación en cada paso
- [ ] Guardado automático de borrador

## Planes y Precios
- [x] Página de planes
- [x] Comparativa de planes (Free, Standard, Pro)
- [x] Descripción de características
- [x] Botones de suscripción
- [x] FAQ

## Pantalla de Éxito de Publicación
- [x] Confirmación de evento publicado
- [x] Enlace al evento
- [x] Opciones de compartir
- [x] Botón para publicar otro evento
- [x] Botón para volver al dashboard

## Procedimientos tRPC
- [ ] Crear artista
- [ ] Actualizar artista
- [ ] Obtener artista por ID
- [ ] Listar artistas con filtros
- [ ] Crear evento
- [ ] Actualizar evento
- [ ] Obtener evento por ID
- [ ] Listar eventos con filtros
- [ ] Crear consulta/inquiry
- [ ] Listar consultas del artista
- [ ] Obtener estadísticas del artista

## Pruebas
- [ ] Tests unitarios para procedimientos tRPC
- [ ] Tests de integración
- [ ] Tests de UI

## Documentación
- [ ] README.md actualizado
- [ ] Guía de desarrollo
- [ ] Documentación de API
