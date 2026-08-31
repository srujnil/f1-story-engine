import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Plain <form method="post"> target from NavBar — works without client JS.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
