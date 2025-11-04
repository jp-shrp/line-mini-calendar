create extension if not exists "pg_trgm" with schema "extensions";


create table "public"."line_event_candidate_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" text not null,
    "user_id" uuid not null,
    "line_user_id" text not null,
    "query" text not null,
    "ai_message" text,
    "candidates" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone not null default (now() + '24:00:00'::interval)
);


alter table "public"."events" add column "search_keywords" text;

CREATE INDEX idx_line_event_candidate_sessions_expires_at ON public.line_event_candidate_sessions USING btree (expires_at);

CREATE INDEX idx_line_event_candidate_sessions_line_user_id ON public.line_event_candidate_sessions USING btree (line_user_id);

CREATE INDEX idx_line_event_candidate_sessions_session_id ON public.line_event_candidate_sessions USING btree (session_id);

CREATE INDEX idx_line_event_candidate_sessions_user_id ON public.line_event_candidate_sessions USING btree (user_id);

CREATE UNIQUE INDEX line_event_candidate_sessions_pkey ON public.line_event_candidate_sessions USING btree (id);

CREATE UNIQUE INDEX line_event_candidate_sessions_session_id_key ON public.line_event_candidate_sessions USING btree (session_id);

alter table "public"."line_event_candidate_sessions" add constraint "line_event_candidate_sessions_pkey" PRIMARY KEY using index "line_event_candidate_sessions_pkey";

alter table "public"."line_event_candidate_sessions" add constraint "line_event_candidate_sessions_session_id_key" UNIQUE using index "line_event_candidate_sessions_session_id_key";

alter table "public"."line_event_candidate_sessions" add constraint "line_event_candidate_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."line_event_candidate_sessions" validate constraint "line_event_candidate_sessions_user_id_fkey";

grant delete on table "public"."line_event_candidate_sessions" to "anon";

grant insert on table "public"."line_event_candidate_sessions" to "anon";

grant references on table "public"."line_event_candidate_sessions" to "anon";

grant select on table "public"."line_event_candidate_sessions" to "anon";

grant trigger on table "public"."line_event_candidate_sessions" to "anon";

grant truncate on table "public"."line_event_candidate_sessions" to "anon";

grant update on table "public"."line_event_candidate_sessions" to "anon";

grant delete on table "public"."line_event_candidate_sessions" to "authenticated";

grant insert on table "public"."line_event_candidate_sessions" to "authenticated";

grant references on table "public"."line_event_candidate_sessions" to "authenticated";

grant select on table "public"."line_event_candidate_sessions" to "authenticated";

grant trigger on table "public"."line_event_candidate_sessions" to "authenticated";

grant truncate on table "public"."line_event_candidate_sessions" to "authenticated";

grant update on table "public"."line_event_candidate_sessions" to "authenticated";

grant delete on table "public"."line_event_candidate_sessions" to "service_role";

grant insert on table "public"."line_event_candidate_sessions" to "service_role";

grant references on table "public"."line_event_candidate_sessions" to "service_role";

grant select on table "public"."line_event_candidate_sessions" to "service_role";

grant trigger on table "public"."line_event_candidate_sessions" to "service_role";

grant truncate on table "public"."line_event_candidate_sessions" to "service_role";

grant update on table "public"."line_event_candidate_sessions" to "service_role";


