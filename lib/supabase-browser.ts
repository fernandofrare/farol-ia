import { createBrowserClient } from "@supabase/ssr";

// Client para uso no navegador (componentes 'use client').
// Usa apenas a ANON KEY — segura para exposição pública, protegida por RLS.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
