import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The magic-link email points here with a `code` query param. Exchange it for
// a session (this sets the auth cookies via lib/supabase/server.ts), then
// send the user back into Community.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/community";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth`);
}
