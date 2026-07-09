-- handle_new_user escribía en tres tablas: profiles y user_roles (esquema
-- alternativo, nunca leído por la aplicación) y artists (la real, que usa el
-- frontend). Se elimina la escritura en las dos primeras para poder retirarlas.
-- La lógica de creación del perfil de artista y del slug se conserva intacta.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
DECLARE
    v_name TEXT;
    v_slug TEXT;
BEGIN
    -- Crear entrada en la tabla artists (la que usa el frontend).
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'artist_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
    );

    v_slug := LOWER(REGEXP_REPLACE(v_name, '[^a-zA-Z0-9\s]', '', 'g'));
    v_slug := REGEXP_REPLACE(v_slug, '\s+', '-', 'g');
    v_slug := TRIM(BOTH '-' FROM v_slug);
    IF v_slug = '' THEN
        v_slug := 'artista-' || LEFT(NEW.id::TEXT, 8);
    END IF;

    WHILE EXISTS (SELECT 1 FROM public.artists WHERE slug = v_slug) LOOP
        v_slug := v_slug || '-' || floor(random() * 1000)::INT;
    END LOOP;

    INSERT INTO public.artists (user_id, slug, artist_name, category, city, country, subscription_plan)
    VALUES (
        NEW.id,
        v_slug,
        v_name,
        COALESCE(NEW.raw_user_meta_data->>'category', 'musica'),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Madrid'),
        COALESCE(NEW.raw_user_meta_data->>'country', 'España'),
        'beta'
    )
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$function$;

-- Funciones de rol que dependen de user_roles y que ninguna política RLS usa.
-- La autorización de admin va por is_admin() contra admin_users, que se conserva.
drop function if exists public.has_role(uuid, app_role) cascade;
drop function if exists public.get_user_role(uuid) cascade;
drop function if exists public.is_artist(uuid) cascade;
drop function if exists public.is_organizer(uuid) cascade;

-- Tablas del esquema alternativo, ya desacopladas.
drop table if exists public.user_roles cascade;
drop table if exists public.profiles cascade;
