-- Bug: el slug generado en BD eliminaba los caracteres acentuados y la ñ en
-- lugar de transliterarlos, divergiendo de slugify() del frontend
-- (client/src/lib/constants.ts, con tests en slugify.test.ts).
--   Antes:  'Ñandú'  -> 'and'      'Añón' -> 'ann'     'José María' -> 'jos-mara'
--   Ahora:  'Ñandú'  -> 'nandu'    'Añón' -> 'anon'    'José María' -> 'jose-maria'
-- Se usa unaccent(), que Supabase provee, instalada en el esquema extensions.

create extension if not exists unaccent with schema extensions;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
DECLARE
    v_name TEXT;
    v_slug TEXT;
BEGIN
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'artist_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
    );

    -- Transliterar acentos y ñ antes de descartar el resto (paridad con slugify()).
    v_slug := LOWER(extensions.unaccent(v_name));
    v_slug := REGEXP_REPLACE(v_slug, '[^a-z0-9\s-]', '', 'g');
    v_slug := REGEXP_REPLACE(v_slug, '[\s-]+', '-', 'g');
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
