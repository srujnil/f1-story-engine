"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Flame, MessageCircle, Radio, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  communityTeams,
  mockCommunityPosts,
  mockTrendingTopics,
} from "@/data/mock-community";
import { teamColor } from "@/lib/team-colors";
import type {
  CommunityComment,
  CommunityPost,
  CommunityReaction,
} from "@/types";

const reactionOptions: Array<{
  value: CommunityReaction;
  label: string;
  icon: string;
}> = [
  { value: "fire", label: "Fire", icon: "🔥" },
  { value: "agree", label: "Agree", icon: "✓" },
  { value: "wild", label: "Wild take", icon: "🌶️" },
];

type ActiveReactions = Record<string, CommunityReaction | undefined>;
type LocalComments = Record<string, CommunityComment[]>;

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
  activeReaction,
  localComments,
  onReact,
  onComment,
}: {
  post: CommunityPost;
  activeReaction?: CommunityReaction;
  localComments: CommunityComment[];
  onReact: (postId: string, reaction: CommunityReaction) => void;
  onComment: (postId: string, body: string) => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const comments = [...post.comments, ...localComments];

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        <Badge className="mt-3 w-fit border border-violet/20 bg-violet/10 text-[#7449b8]">
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
            const active = activeReaction === option.value;
            const count = post.reactions[option.value] + (active ? 1 : 0);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                aria-label={`${option.label}, ${count} reactions`}
                onClick={() => onReact(post.id, option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
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
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </button>
        </div>

        {commentsOpen && (
          <div className="mt-5 space-y-4 rounded-2xl bg-[#f7f8fb] p-4">
            {comments.length ? (
              <ul
                className="space-y-4"
                aria-label={`Comments on ${post.headline}`}
              >
                {comments.map((comment) => (
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

            <form
              onSubmit={submitComment}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor={`comment-${post.id}`} className="sr-only">
                Add a demo comment
              </label>
              <input
                id={`comment-${post.id}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={280}
                placeholder="Add a demo comment…"
                className="min-h-10 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-electric"
              />
              <Button
                type="submit"
                className="bg-electric text-white hover:bg-[#248ed0]"
              >
                <Send aria-hidden="true" /> Post locally
              </Button>
            </form>
            <p className="text-xs text-black/40">
              Prototype only—comments reset when the page refreshes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CommunityPaddock() {
  const [selectedTeam, setSelectedTeam] = useState("All paddock");
  const [activeReactions, setActiveReactions] = useState<ActiveReactions>({});
  const [localComments, setLocalComments] = useState<LocalComments>({});

  const visiblePosts = useMemo(
    () =>
      selectedTeam === "All paddock"
        ? mockCommunityPosts
        : mockCommunityPosts.filter(
            (post) => post.favoriteTeam === selectedTeam,
          ),
    [selectedTeam],
  );

  function react(postId: string, reaction: CommunityReaction) {
    setActiveReactions((current) => ({
      ...current,
      [postId]: current[postId] === reaction ? undefined : reaction,
    }));
  }

  function addComment(postId: string, body: string) {
    const comment: CommunityComment = {
      id: `local-${postId}-${Date.now()}`,
      author: "Demo fan",
      favoriteTeam: selectedTeam === "All paddock" ? "Williams" : selectedTeam,
      body,
      createdAtLabel: "Just now",
    };
    setLocalComments((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), comment],
    }));
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
            <Radio aria-hidden="true" className="size-3.5" /> Demo mode
          </span>
        </div>

        <div
          className="mb-5 flex gap-2 overflow-x-auto pb-2"
          aria-label="Filter by favourite team"
        >
          {["All paddock", ...communityTeams].map((team) => {
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
              activeReaction={activeReactions[post.id]}
              localComments={localComments[post.id] ?? []}
              onReact={react}
              onComment={addComment}
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
        <Card className="border border-violet/20 bg-[#f7f1ff] shadow-none">
          <CardHeader>
            <Sparkles aria-hidden="true" className="mb-2 size-5 text-violet" />
            <CardTitle className="text-xl font-black">
              Your paddock identity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-black/60">
            Sign-in, permanent favourite teams, and saved activity arrive with
            the Supabase slice.
          </CardContent>
        </Card>

        <Card className="border border-amber/30 bg-[#fff9df] shadow-none">
          <CardHeader>
            <Flame aria-hidden="true" className="mb-2 size-5 text-[#bd7d00]" />
            <CardTitle className="text-xl font-black">Trending now</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {mockTrendingTopics.map((topic, index) => (
                <li key={topic.label} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-black/35">
                    0{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{topic.label}</p>
                    <p className="text-xs text-black/45">
                      {topic.posts} demo posts
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
