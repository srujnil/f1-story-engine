import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommunityComment, CommunityPost, CommunityReaction } from "@/types";

// Manual row types matching supabase/schema.sql. Not generated from the live
// DB yet (`supabase gen types typescript` would be the next step) — until
// then, these are the contract we're trusting.
type ProfileRow = { display_name: string; favorite_team: string | null } | null;

type CommentRow = {
  id: string;
  author_id: string | null;
  author_display_name: string | null;
  author_favorite_team: string | null;
  body: string;
  created_at: string;
  author: ProfileRow | ProfileRow[] | null;
};

type ReactionRow = { author_id: string; reaction_type: CommunityReaction };

type PostRow = {
  id: string;
  author_id: string | null;
  author_display_name: string | null;
  author_favorite_team: string | null;
  category: CommunityPost["category"];
  headline: string;
  body: string;
  created_at: string;
  author: ProfileRow | ProfileRow[] | null;
  comments: CommentRow[];
  reactions: ReactionRow[];
};

function firstProfile(author: ProfileRow | ProfileRow[] | null): ProfileRow {
  return Array.isArray(author) ? (author[0] ?? null) : author;
}

function relativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${Math.round(diffHours / 24)} d ago`;
}

function identity(row: {
  author_id: string | null;
  author_display_name: string | null;
  author_favorite_team: string | null;
  author: ProfileRow | ProfileRow[] | null;
}): { name: string; team: string } {
  const profile = firstProfile(row.author);
  if (row.author_id && profile) {
    return { name: profile.display_name, team: profile.favorite_team ?? "Unaffiliated" };
  }
  return {
    name: row.author_display_name ?? "Story Engine Desk",
    team: row.author_favorite_team ?? "Unaffiliated",
  };
}

function mapComment(row: CommentRow): CommunityComment {
  const who = identity(row);
  return {
    id: row.id,
    author: who.name,
    favoriteTeam: who.team,
    body: row.body,
    createdAtLabel: relativeTime(row.created_at),
  };
}

function mapPost(row: PostRow, currentUserId: string | null): CommunityPost {
  const who = identity(row);
  const counts: Record<CommunityReaction, number> = {
    fire: 0,
    agree: 0,
    wild: 0,
    disagree: 0,
  };
  let myReaction: CommunityReaction | undefined;
  for (const reaction of row.reactions) {
    counts[reaction.reaction_type] += 1;
    if (currentUserId && reaction.author_id === currentUserId) {
      myReaction = reaction.reaction_type;
    }
  }

  return {
    id: row.id,
    author: who.name,
    authorRole: row.author_id ? "Member" : "Editor",
    favoriteTeam: who.team,
    category: row.category,
    headline: row.headline,
    body: row.body,
    createdAtLabel: relativeTime(row.created_at),
    reactions: counts,
    myReaction,
    comments: [...row.comments]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(mapComment),
  };
}

export async function getCommunityFeed(
  supabase: SupabaseClient,
  currentUserId: string | null,
): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, author_id, author_display_name, author_favorite_team, category, headline, body, created_at,
       author:profiles!posts_author_id_fkey ( display_name, favorite_team ),
       comments ( id, author_id, author_display_name, author_favorite_team, body, created_at,
         author:profiles!comments_author_id_fkey ( display_name, favorite_team ) ),
       reactions ( author_id, reaction_type )`,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as PostRow[]).map((row) => mapPost(row, currentUserId));
}
