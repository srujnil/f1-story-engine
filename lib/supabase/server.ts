import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Fresh client per request — must not be a module-level singleton, since it's
// wired to this specific request's cookies (auth session).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component that can't write cookies (no
            // active response, e.g. during static rendering). middleware.ts
            // refreshes the session on every request, so this is safe to
            // ignore rather than throw.
          }
        },
      },
    },
  );
}
