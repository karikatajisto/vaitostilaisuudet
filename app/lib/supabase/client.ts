import { createClient } from '@supabase/supabase-js'

// Anon-key client — safe to use from both Server Components and client code.
// Subject to RLS (e.g. the public read policy on `dissertations`).
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
