# TUESDI - Artist Platform

Plataforma integral para artistas y organizadores de eventos. TUESDI facilita la conexión entre el talento artístico y las oportunidades de presentación, permitiendo a los artistas gestionar su perfil, publicar eventos y recibir consultas.

## 🚀 Tecnologías

- **Frontend:** React 19, Vite 7, Tailwind CSS 4
- **Backend/Base de Datos:** Supabase (PostgreSQL, Auth)
- **Despliegue:** Vercel
- **Enrutamiento:** Wouter

## 🛠️ Configuración Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/dgr198213-ui/tuesdi-artist-platform.git
    cd tuesdi-artist-platform
    ```

2.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
    ```

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    pnpm dev
    ```

## 🌐 Despliegue en Vercel

Para desplegar en Vercel, asegúrate de configurar las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el panel de control de Vercel.

El archivo `vercel.json` ya está configurado para manejar el enrutamiento de la Single Page Application (SPA).

## 🗄️ Base de Datos (Supabase)

El esquema de la base de datos incluye las siguientes tablas principales:
- `artists`: Perfiles de los artistas.
- `events`: Eventos publicados.
- `inquiries`: Consultas enviadas a los artistas.
- `subscription_plans`: Planes de suscripción disponibles.

Consulta `supabase_schema_guide.md` para más detalles sobre la estructura de la base de datos.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
