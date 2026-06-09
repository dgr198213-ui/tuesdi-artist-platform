# Guía de Esquema para Supabase

Este documento detalla el esquema de las tablas necesarias para la migración a Supabase, incluyendo los campos básicos, tipos de datos en PostgreSQL y relaciones.

## 1. Tabla: `artists`

Representa a los artistas registrados en la plataforma.

| Campo           | Tipo de Dato (PostgreSQL) | Descripción                                       | Relaciones                 |
| :-------------- | :------------------------ | :------------------------------------------------ | :------------------------- |
| `id`            | `UUID` (PK)               | Identificador único del artista.                  |                            |
| `user_id`       | `UUID` (FK)               | ID del usuario de Supabase asociado al artista.   | `auth.users.id`            |
| `name`          | `TEXT`                    | Nombre artístico o nombre completo.                |                            |
| `category`      | `TEXT`                    | Categoría musical o artística.                    |                            |
| `bio`           | `TEXT`                    | Biografía del artista.                            |                            |
| `city`          | `TEXT`                    | Ciudad de residencia del artista.                 |                            |
| `country`       | `TEXT`                    | País de residencia del artista.                   |                            |
| `verified`      | `BOOLEAN`                 | Indica si el perfil del artista está verificado.  |                            |
| `rating`        | `NUMERIC(2,1)`            | Calificación promedio del artista.                |                            |
| `reviews`       | `INTEGER`                 | Número de reseñas recibidas.                      |                            |
| `avatar_url`    | `TEXT`                    | URL de la imagen de perfil del artista.           |                            |
| `cover_url`     | `TEXT`                    | URL de la imagen de portada del artista.          |                            |
| `gallery_urls`  | `TEXT[]`                  | Array de URLs de imágenes para la galería.        |                            |
| `instagram_url` | `TEXT`                    | URL del perfil de Instagram.                      |                            |
| `spotify_url`   | `TEXT`                    | URL del perfil de Spotify.                        |                            |
| `website_url`   | `TEXT`                    | URL del sitio web personal.                       |                            |
| `price_from`    | `TEXT`                    | Precio base o "desde" para contrataciones.        |                            |
| `views`         | `INTEGER`                 | Número de vistas del perfil.                      |                            |
| `inquiries`     | `INTEGER`                 | Número de consultas recibidas.                    |                            |
| `events_count`  | `INTEGER`                 | Número de eventos publicados.                     |                            |
| `followers`     | `INTEGER`                 | Número de seguidores.                             |                            |
| `created_at`    | `TIMESTAMPZ`              | Fecha y hora de creación del registro.            |                            |
| `updated_at`    | `TIMESTAMPZ`              | Fecha y hora de la última actualización.          |                            |

## 2. Tabla: `events`

Almacena la información de los eventos publicados por los artistas.

| Campo           | Tipo de Dato (PostgreSQL) | Descripción                                       | Relaciones                 |
| :-------------- | :------------------------ | :------------------------------------------------ | :------------------------- |
| `id`            | `UUID` (PK)               | Identificador único del evento.                   |                            |
| `artist_id`     | `UUID` (FK)               | ID del artista que publica el evento.             | `artists.id`               |
| `title`         | `TEXT`                    | Título del evento.                                |                            |
| `description`   | `TEXT`                    | Descripción detallada del evento.                 |                            |
| `event_date`    | `DATE`                    | Fecha del evento.                                 |                            |
| `event_time`    | `TIME`                    | Hora del evento.                                  |                            |
| `venue`         | `TEXT`                    | Lugar donde se realizará el evento.               |                            |
| `city`          | `TEXT`                    | Ciudad del evento.                                |                            |
| `country`       | `TEXT`                    | País del evento.                                  |                            |
| `price`         | `TEXT`                    | Precio de la entrada (puede ser un rango o texto).|                            |
| `image_url`     | `TEXT`                    | URL de la imagen promocional del evento.          |                            |
| `contact_email` | `TEXT`                    | Correo electrónico de contacto para el evento.    |                            |
| `contact_phone` | `TEXT`                    | Teléfono de contacto para el evento.              |                            |
| `status`        | `TEXT`                    | Estado del evento (ej: 'published', 'draft').     |                            |
| `attendees`     | `INTEGER`                 | Número de asistentes o interesados.               |                            |
| `created_at`    | `TIMESTAMPZ`              | Fecha y hora de creación del registro.            |                            |
| `updated_at`    | `TIMESTAMPZ`              | Fecha y hora de la última actualización.          |                            |

## 3. Tabla: `inquiries`

Registra las consultas o mensajes enviados a los artistas.

| Campo           | Tipo de Dato (PostgreSQL) | Descripción                                       | Relaciones                 |
| :-------------- | :------------------------ | :------------------------------------------------ | :------------------------- |
| `id`            | `UUID` (PK)               | Identificador único de la consulta.               |                            |
| `artist_id`     | `UUID` (FK)               | ID del artista al que se dirige la consulta.      | `artists.id`               |
| `user_id`       | `UUID` (FK)               | ID del usuario que realiza la consulta.           | `auth.users.id`            |
| `name`          | `TEXT`                    | Nombre de la persona que consulta.                |                            |
| `email`         | `TEXT`                    | Correo electrónico de la persona que consulta.    |                            |
| `subject`       | `TEXT`                    | Asunto de la consulta.                            |                            |
| `message`       | `TEXT`                    | Contenido del mensaje.                            |                            |
| `status`        | `TEXT`                    | Estado de la consulta (ej: 'pending', 'read').    |                            |
| `created_at`    | `TIMESTAMPZ`              | Fecha y hora de creación del registro.            |                            |
| `updated_at`    | `TIMESTAMPZ`              | Fecha y hora de la última actualización.          |                            |

## 4. Tabla: `subscription_plans`

Define los diferentes planes de suscripción disponibles.

| Campo           | Tipo de Dato (PostgreSQL) | Descripción                                       | Relaciones                 |
| :-------------- | :------------------------ | :------------------------------------------------ | :------------------------- |
| `id`            | `UUID` (PK)               | Identificador único del plan.                     |                            |
| `name`          | `TEXT`                    | Nombre del plan (ej: 'Básico', 'Premium').        |                            |
| `description`   | `TEXT`                    | Descripción del plan.                             |                            |
| `price`         | `NUMERIC(10,2)`           | Precio mensual del plan.                          |                            |
| `features`      | `TEXT[]`                  | Array de características incluidas en el plan.    |                            |
| `created_at`    | `TIMESTAMPZ`              | Fecha y hora de creación del registro.            |                            |
| `updated_at`    | `TIMESTAMPZ`              | Fecha y hora de la última actualización.          |                            |

## 5. Tabla: `artist_stats`

Almacena estadísticas adicionales para los artistas (si se requiere una tabla separada para escalabilidad o complejidad).

| Campo           | Tipo de Dato (PostgreSQL) | Descripción                                       | Relaciones                 |
| :-------------- | :------------------------ | :------------------------------------------------ | :------------------------- |
| `id`            | `UUID` (PK)               | Identificador único de la estadística.            |                            |
| `artist_id`     | `UUID` (FK)               | ID del artista asociado a estas estadísticas.     | `artists.id`               |
| `date`          | `DATE`                    | Fecha de la estadística.                          |                            |
| `views_daily`   | `INTEGER`                 | Vistas diarias del perfil.                        |                            |
| `events_posted` | `INTEGER`                 | Eventos publicados en ese día/periodo.            |                            |
| `inquiries_rec` | `INTEGER`                 | Consultas recibidas en ese día/periodo.           |                            |
| `created_at`    | `TIMESTAMPZ`              | Fecha y hora de creación del registro.            |                            |
| `updated_at`    | `TIMESTAMPZ`              | Fecha y hora de la última actualización.          |                            |
