create extension if not exists "pgjwt" with schema "extensions";


create type "public"."auth_method" as enum ('anonymous', 'line', 'line_anonymous');

create sequence "public"."drizzle_migrations_id_seq";

create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" character varying(50) not null,
    "color" character varying(7) not null,
    "icon" text,
    "is_system_default" boolean not null default false,
    "created_at" timestamp without time zone not null default now()
);


create table "public"."drizzle_migrations" (
    "id" integer not null default nextval('drizzle_migrations_id_seq'::regclass),
    "hash" text not null,
    "created_at" bigint
);


create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" character varying(100) not null,
    "description" text,
    "category" character varying(50) not null default 'other'::character varying,
    "icon_url" text,
    "start_datetime" timestamp without time zone not null,
    "end_datetime" timestamp without time zone not null,
    "color" character varying(7),
    "is_deleted" boolean not null default false,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."reminders" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "remind_at" timestamp without time zone not null,
    "is_sent" boolean not null default false,
    "created_at" timestamp without time zone not null default now()
);


create table "public"."users" (
    "id" uuid not null,
    "line_user_id" character varying(255),
    "display_name" character varying(100),
    "profile_image" text,
    "email" character varying(255),
    "auth0_id" text,
    "auth_method" auth_method default 'anonymous'::auth_method,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


alter sequence "public"."drizzle_migrations_id_seq" owned by "public"."drizzle_migrations"."id";

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX drizzle_migrations_pkey ON public.drizzle_migrations USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX reminders_pkey ON public.reminders USING btree (id);

CREATE UNIQUE INDEX users_auth0_id_unique ON public.users USING btree (auth0_id);

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);

CREATE UNIQUE INDEX users_line_user_id_unique ON public.users USING btree (line_user_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."drizzle_migrations" add constraint "drizzle_migrations_pkey" PRIMARY KEY using index "drizzle_migrations_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."reminders" add constraint "reminders_pkey" PRIMARY KEY using index "reminders_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."categories" add constraint "categories_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_user_id_users_id_fk";

alter table "public"."events" add constraint "events_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_user_id_users_id_fk";

alter table "public"."reminders" add constraint "reminders_event_id_events_id_fk" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."reminders" validate constraint "reminders_event_id_events_id_fk";

alter table "public"."users" add constraint "users_auth0_id_unique" UNIQUE using index "users_auth0_id_unique";

alter table "public"."users" add constraint "users_email_unique" UNIQUE using index "users_email_unique";

alter table "public"."users" add constraint "users_line_user_id_unique" UNIQUE using index "users_line_user_id_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert new user into public.users
        INSERT INTO public.users (
            id,
            email,
            display_name,
            profile_image,
            line_user_id,
            auth0_id,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
            COALESCE(NEW.raw_user_meta_data->>'profile_image', NULL),
            COALESCE(NEW.raw_user_meta_data->>'line_user_id', NULL),
            COALESCE(NEW.raw_user_meta_data->>'auth0_id', NULL),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Update existing user in public.users
        UPDATE public.users
        SET
            email = NEW.email,
            display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', display_name),
            profile_image = COALESCE(NEW.raw_user_meta_data->>'profile_image', profile_image),
            line_user_id = COALESCE(NEW.raw_user_meta_data->>'line_user_id', line_user_id),
            auth0_id = COALESCE(NEW.raw_user_meta_data->>'auth0_id', auth0_id),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Delete user from public.users
        DELETE FROM public.users WHERE id = OLD.id;
        RETURN OLD;

    END IF;

    RETURN NULL;
END;
$function$
;

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."drizzle_migrations" to "anon";

grant insert on table "public"."drizzle_migrations" to "anon";

grant references on table "public"."drizzle_migrations" to "anon";

grant select on table "public"."drizzle_migrations" to "anon";

grant trigger on table "public"."drizzle_migrations" to "anon";

grant truncate on table "public"."drizzle_migrations" to "anon";

grant update on table "public"."drizzle_migrations" to "anon";

grant delete on table "public"."drizzle_migrations" to "authenticated";

grant insert on table "public"."drizzle_migrations" to "authenticated";

grant references on table "public"."drizzle_migrations" to "authenticated";

grant select on table "public"."drizzle_migrations" to "authenticated";

grant trigger on table "public"."drizzle_migrations" to "authenticated";

grant truncate on table "public"."drizzle_migrations" to "authenticated";

grant update on table "public"."drizzle_migrations" to "authenticated";

grant delete on table "public"."drizzle_migrations" to "service_role";

grant insert on table "public"."drizzle_migrations" to "service_role";

grant references on table "public"."drizzle_migrations" to "service_role";

grant select on table "public"."drizzle_migrations" to "service_role";

grant trigger on table "public"."drizzle_migrations" to "service_role";

grant truncate on table "public"."drizzle_migrations" to "service_role";

grant update on table "public"."drizzle_migrations" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."reminders" to "anon";

grant insert on table "public"."reminders" to "anon";

grant references on table "public"."reminders" to "anon";

grant select on table "public"."reminders" to "anon";

grant trigger on table "public"."reminders" to "anon";

grant truncate on table "public"."reminders" to "anon";

grant update on table "public"."reminders" to "anon";

grant delete on table "public"."reminders" to "authenticated";

grant insert on table "public"."reminders" to "authenticated";

grant references on table "public"."reminders" to "authenticated";

grant select on table "public"."reminders" to "authenticated";

grant trigger on table "public"."reminders" to "authenticated";

grant truncate on table "public"."reminders" to "authenticated";

grant update on table "public"."reminders" to "authenticated";

grant delete on table "public"."reminders" to "service_role";

grant insert on table "public"."reminders" to "service_role";

grant references on table "public"."reminders" to "service_role";

grant select on table "public"."reminders" to "service_role";

grant trigger on table "public"."reminders" to "service_role";

grant truncate on table "public"."reminders" to "service_role";

grant update on table "public"."reminders" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."users" to "supabase_auth_admin";

grant insert on table "public"."users" to "supabase_auth_admin";

grant references on table "public"."users" to "supabase_auth_admin";

grant select on table "public"."users" to "supabase_auth_admin";

grant trigger on table "public"."users" to "supabase_auth_admin";

grant truncate on table "public"."users" to "supabase_auth_admin";

grant update on table "public"."users" to "supabase_auth_admin";


