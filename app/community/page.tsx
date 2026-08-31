import { CommunityPaddock } from "@/components/community-paddock";
import { DataUnavailable } from "@/components/data-unavailable";
import { NavBar } from "@/components/nav-bar";
import { getCommunityFeed } from "@/lib/community";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUserTeam: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("favorite_team")
      .eq("id", user.id)
      .maybeSingle();
    currentUserTeam = profile?.favorite_team ?? null;
  }

  let posts;
  try {
    posts = await getCommunityFeed(supabase, user?.id ?? null);
  } catch (error: unknown) {
    console.error("Supabase community feed fetch failed", error);
    posts = null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="grid items-end gap-6 border-b border-black/10 pb-9 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <span className="size-2 rounded-full bg-primary" />
              Community
            </div>
            <h1 className="max-w-4xl font-heading text-5xl font-black leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Talk racing. <span className="text-electric">Pick a side.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Team colours, sharp opinions, and race conversations—without
              presenting fan takes as verified news.
            </p>
          </div>
          <div className="rounded-2xl border border-electric/20 bg-[#eef9ff] p-4 text-sm leading-relaxed text-black/60">
            <strong className="mb-1 block font-heading text-base text-[#24242d]">
              Real, sign-in required
            </strong>
            Reactions and comments are saved for good. Reading is open to
            everyone; posting needs a quick email sign-in.
          </div>
        </section>
        {posts ? (
          <CommunityPaddock
            initialPosts={posts}
            currentUserId={user?.id ?? null}
            currentUserTeam={currentUserTeam}
          />
        ) : (
          <DataUnavailable
            title="Community is temporarily unavailable"
            message="Supabase could not be reached. Try refreshing in a few minutes."
          />
        )}
      </main>
    </div>
  );
}
