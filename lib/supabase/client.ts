import { createBrowserClient } from "@supabase/ssr";

// Singleton browser client for Client Components. Safe to call repeatedly —
// createBrowserClient reuses the existing instance internally.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
