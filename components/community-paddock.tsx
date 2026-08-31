"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Flame, MessageCircle, Radio, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { COMMUNITY_TEAMS, teamColor } from "@/lib/team-colors";
import type { CommunityPost, CommunityReaction } from "@/types";

const reactionOptions: Array<{
  value: CommunityReaction;
  label: string;
  icon: string;
}> = [
  { value: "fire", label: "Fire", icon: "🔥" },
  { value: "agree", label: "Agree", icon: "✓" },
  { value: "wild", label: "Wild take", icon: "🌶️" },
  // Inside joke — the disagree reaction. Deliberately not "Disagree" as the
  // label; the bit is the point.
  { value: "disagree", label: "No Mikey No", icon: "🔴" },
];

function TeamMark({ team }: { team: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/55">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: teamColor(team) }}
      />
      {team}
    </span>
  );
}

function DiscussionCard({
  post,
  signedIn,
  busy,
  onReact,
  onComment,
  onRequireSignIn,
}: {
  post: CommunityPost;
  signedIn: boolean;
  busy: boolean;
  onReact: (postId: string, reaction: CommunityReaction) => void;
  onComment: (postId: string, body: string) => void;
  onRequireSignIn: () => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) {
      onRequireSignIn();
      return;
    }
    const body = draft.trim();
    if (!body) return;
    onComment(post.id, body);
    setDraft("");
    setCommentsOpen(true);
  }

  return (
    <Card className="border border-black/10 bg-white py-0 shadow-sm">
      <div
        aria-hidden="true"
        className="h-1.5 w-full"
        style={{ backgroundColor: teamColor(post.favoriteTeam) }}
      />
      <CardHeader className="pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading font-extrabold">{post.author}</span>
            <Badge variant="outline" className="border-black/10 bg-[#f7f8fb]">
              {post.authorRole}
            </Badge>
            <TeamMark team={post.favoriteTeam} />
          </div>
          <span className="text-xs text-muted-foreground">
            {post.createdAtLabel}
          </span>
        </div>
        <Badge className="mt-3 w-fit border border-primary/20 bg-primary/10 text-primary">
          {post.category}
        </Badge>
        <CardTitle className="mt-2 text-2xl font-black tracking-tight">
          {post.headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        <p className="text-[15px] leading-relaxed text-black/65">{post.body}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-black/[0.07] pt-4">
          {reactionOptions.map((option) => {
            const active = post.myReaction === option.value;
            const count = post.reactions[option.value];
            return (
              <button
                key={option.value}
                type="button"
                disabled={busy}
                aria-pressed={active}
                aria-label={`${option.label}, ${count} reactions`}
                onClick={() =>
                  signedIn ? onReact(post.id, option.value) : onRequireSignIn()
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric disabled:opacity-50 ${
                  active
                    ? "border-electric/40 bg-electric/15 text-[#1479ad]"
                    : "border-black/10 bg-[#f7f8fb] text-black/60 hover:bg-electric/10"
                }`}
              >
                <span aria-hidden="true">{option.icon}</span> {option.label}{" "}
                {count}
              </button>
            );
          })}
          <button
            type="button"
            aria-expanded={commentsOpen}
            onClick={() => setCommentsOpen((open) => !open)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-black/55 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            {post.comments.length}{" "}
            {post.comments.length === 1 ? "comment" : "comments"}
          </button>
        </div>

        {commentsOpen && (
          <div className="mt-5 space-y-4 rounded-2xl bg-[#f7f8fb] p-4">
            {post.comments.length ? (
              <ul
                className="space-y-4"
                aria-label={`Comments on ${post.headline}`}
              >
                {post.comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="border-b border-black/[0.07] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-bold">{comment.author}</span>
                      <TeamMark team={comment.favoriteTeam} />
                      <span className="ml-auto text-xs text-muted-foreground">
                        {comment.createdAtLabel}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-black/65">
                      {comment.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start this discussion.
              </p>
            )}

            {signedIn ? (
              <form
                onSubmit={submitComment}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <label htmlFor={`comment-${post.id}`} className="sr-only">
                  Add a comment
                </label>
                <input
                  id={`comment-${post.id}`}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={280}
                  disabled={busy}
                  placeholder="Add a comment…"
                  className="min-h-10 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-electric"
                />
                <Button
                  type="submit"
                  disabled={busy}
                  className="bg-electric text-white hover:bg-[#248ed0]"
                >
                  <Send aria-hidden="true" /> Post
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={onRequireSignIn}
                className="text-sm font-bold text-primary underline-offset-4 hover:underline"
              >
                Sign in to comment →
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CommunityPaddock({
  initialPosts,
  currentUserId,
  currentUserTeam,
}: {
  initialPosts: CommunityPost[];
  currentUserId: string | null;
  currentUserTeam: string | null;
}) {
  const router = useRouter();
  const signedIn = currentUserId !== null;
  const [selectedTeam, setSelectedTeam] = useState("All paddock");
  const [busy, setBusy] = useState(false);

  const visiblePosts = useMemo(
    () =>
      selectedTeam === "All paddock"
        ? initialPosts
        : initialPosts.filter((post) => post.favoriteTeam === selectedTeam),
    [initialPosts, selectedTeam],
  );

  // Real trending list: post count + comment/reaction activity per category,
  // computed from the live feed rather than a fixture.
  const trendingTopics = useMemo(() => {
    const byCategory = new Map<string, { posts: number; activity: number }>();
    for (const post of initialPosts) {
      const entry = byCategory.get(post.category) ?? { posts: 0, activity: 0 };
      entry.posts += 1;
      entry.activity +=
        post.comments.length +
        post.reactions.fire +
        post.reactions.agree +
        post.reactions.wild;
      byCategory.set(post.category, entry);
    }
    return [...byCategory.entries()]
      .sort((a, b) => b[1].activity - a[1].activity)
      .slice(0, 3)
      .map(([label, entry]) => ({ label, posts: entry.posts }));
  }, [initialPosts]);

  function requireSignIn() {
    router.push("/auth/sign-in");
  }

  async function react(postId: string, reaction: CommunityReaction) {
    if (!currentUserId || busy) return;
    setBusy(true);
    const supabase = createClient();
    const post = initialPosts.find((p) => p.id === postId);

    if (post?.myReaction === reaction) {
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", postId)
        .eq("author_id", currentUserId);
    } else {
      await supabase
        .from("reactions")
        .upsert(
          { post_id: postId, author_id: currentUserId, reaction_type: reaction },
          { onConflict: "post_id,author_id" },
        );
    }
    router.refresh();
    setBusy(false);
  }

  async function addComment(postId: string, body: string) {
    if (!currentUserId || busy) return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: currentUserId, body });
    router.refresh();
    setBusy(false);
  }

  async function setFavoriteTeam(team: string) {
    if (!currentUserId) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ favorite_team: team })
      .eq("id", currentUserId);
    router.refresh();
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <section aria-labelledby="discussion-heading" className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1479ad]">
              Live conversations
            </p>
            <h2
              id="discussion-heading"
              className="font-heading text-3xl font-black tracking-tight"
            >
              The shared paddock
            </h2>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-[#eaf8f4] px-3 py-1.5 text-xs font-bold text-[#147f6a] sm:inline-flex">
            <Radio aria-hidden="true" className="size-3.5" /> Live
          </span>
        </div>

        <div
          className="mb-5 flex gap-2 overflow-x-auto pb-2"
          aria-label="Filter by favourite team"
        >
          {["All paddock", ...COMMUNITY_TEAMS].map((team) => {
            const active = team === selectedTeam;
            return (
              <button
                key={team}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedTeam(team)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
                  active
                    ? "border-electric bg-electric text-white"
                    : "border-black/10 bg-white hover:bg-electric/10"
                }`}
              >
                {team !== "All paddock" && (
                  <span
                    aria-hidden="true"
                    className="mr-1.5 inline-block size-2 rounded-full"
                    style={{ backgroundColor: teamColor(team) }}
                  />
                )}
                {team}
              </button>
            );
          })}
        </div>

        <div className="space-y-5">
          {visiblePosts.map((post) => (
            <DiscussionCard
              key={post.id}
              post={post}
              signedIn={signedIn}
              busy={busy}
              onReact={react}
              onComment={addComment}
              onRequireSignIn={requireSignIn}
            />
          ))}
          {!visiblePosts.length && (
            <div className="rounded-3xl border border-dashed border-black/15 bg-[#f7f8fb] p-10 text-center">
              <p className="font-heading text-xl font-bold">
                No discussion here yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Switch back to the shared paddock while this team room warms up.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-5" aria-label="Community highlights">
        {signedIn && !currentUserTeam ? (
          <Card className="border border-electric/25 bg-[#eef9ff] shadow-none">
            <CardHeader>
              <Sparkles aria-hidden="true" className="mb-2 size-5 text-[#1479ad]" />
              <CardTitle className="text-xl font-black">
                Pick your team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMMUNITY_TEAMS.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => setFavoriteTeam(team)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-black/70 hover:bg-electric/10"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full"
                      style={{ backgroundColor: teamColor(team) }}
                    />
                    {team}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-primary/20 bg-[#fff1f4] shadow-none">
            <CardHeader>
              <Sparkles aria-hidden="true" className="mb-2 size-5 text-primary" />
              <CardTitle className="text-xl font-black">
                Your paddock identity
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-black/60">
              {signedIn ? (
                <>
                  Backing <strong className="text-[#24242d]">{currentUserTeam}</strong>.
                  React and comment freely — it&apos;s saved to your account.
                </>
              ) : (
                <>
                  Sign in to react, comment, and pick a favourite team.{" "}
                  <button
                    type="button"
                    onClick={requireSignIn}
                    className="font-bold text-primary underline-offset-4 hover:underline"
                  >
                    Sign in →
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border border-amber/30 bg-[#fff9df] shadow-none">
          <CardHeader>
            <Flame aria-hidden="true" className="mb-2 size-5 text-[#bd7d00]" />
            <CardTitle className="text-xl font-black">Trending now</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {trendingTopics.map((topic, index) => (
                <li key={topic.label} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-black/35">
                    0{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{topic.label}</p>
                    <p className="text-xs text-black/45">
                      {topic.posts} {topic.posts === 1 ? "post" : "posts"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
