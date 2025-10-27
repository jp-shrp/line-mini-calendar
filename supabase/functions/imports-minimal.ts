// Hono Framework (minimal for auth-api)
export { Hono, type Env } from 'hono'
export type { Context, Input, MiddlewareHandler, Next } from 'hono'
export { cors } from 'hono/cors'
export { HTTPException } from 'hono/http-exception'
export { jwt } from 'hono/jwt'

// Validation
export { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts'

// Supabase
export type { User } from 'https://deno.land/x/gotrue@3.0.0/mod.ts'
export { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
