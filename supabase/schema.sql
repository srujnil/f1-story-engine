-- F1 Story Engine — Community Paddock persistence schema (v0)
-- Run this once in Supabase Studio: SQL Editor → New query → paste → Run.
-- Matches the decisions logged in SPEC.md / CLAUDE.md ("Persistent community
-- guardrails"): public read, sign-in-gated insert, no update/delete policies
-- (removal happens via the dashboard for now), and simple rate limits.
--
-- NOTE: this project has "Automatically expose new tables" turned OFF
-- (deliberately, for tighter default access) — RLS policies alone are not
-- enough without the matching GRANTs at the bottom of this file. RLS only
-- restricts *which rows* a role can see; the role needs baseline table
-- privileges first, or every query 42501s with "permission denied".

-- ── profiles ────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  favorite_team text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile the moment someone signs up via magic link.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── posts ───────────────────────────────────────────────────────────────
-- author_id is nullable to cover seeded "Story Engine Desk" editor prompts
-- (no real auth user behind them); a real user's post always sets author_id
-- and leaves the two author_* override columns null.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  author_display_name text,
  author_favorite_team text,
  category text not null check (category in ('Paddock Debate', 'Hot Take', 'Race Chat')),
  headline text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "posts are publicly readable"
  on public.posts for select
  using (true);

create policy "authenticated users can create their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- ── comments ────────────────────────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  author_display_name text,
  author_favorite_team text,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments (post_id);

alter table public.comments enable row level security;

create policy "comments are publicly readable"
  on public.comments for select
  using (true);

create policy "authenticated users can create their own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

-- ── reactions ───────────────────────────────────────────────────────────
-- One row per (post, author) — matches the existing UI's one-active-reaction
-- toggle exactly. The app upserts to change reaction, deletes to clear it.
create table public.reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('fire', 'agree', 'wild', 'disagree')),
  created_at timestamptz not null default now(),
  primary key (post_id, author_id)
);

alter table public.reactions enable row level security;

create policy "reactions are publicly readable"
  on public.reactions for select
  using (true);

create policy "users can set their own reaction"
  on public.reactions for insert
  with check (auth.uid() = author_id);

create policy "users can change their own reaction"
  on public.reactions for update
  using (auth.uid() = author_id);

create policy "users can remove their own reaction"
  on public.reactions for delete
  using (auth.uid() = author_id);

-- ── reports ─────────────────────────────────────────────────────────────
-- Deliberately no select policy — reports are only visible via the Supabase
-- dashboard table view (service role bypasses RLS). That's v0's entire
-- "admin review" story: you triage in Studio, no custom admin UI yet.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "users can file their own reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- ── rate limiting ───────────────────────────────────────────────────────
-- Deliberately simple: a Postgres check, not a queue or external service.
create function public.enforce_post_rate_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*) from public.posts
    where author_id = new.author_id
      and created_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'Rate limit: max 5 posts per 10 minutes';
  end if;
  return new;
end;
$$;

create trigger posts_rate_limit
  before insert on public.posts
  for each row
  when (new.author_id is not null)
  execute function public.enforce_post_rate_limit();

create function public.enforce_comment_rate_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*) from public.comments
    where author_id = new.author_id
      and created_at > now() - interval '10 minutes'
  ) >= 20 then
    raise exception 'Rate limit: max 20 comments per 10 minutes';
  end if;
  return new;
end;
$$;

create trigger comments_rate_limit
  before insert on public.comments
  for each row
  when (new.author_id is not null)
  execute function public.enforce_comment_rate_limit();

-- ── seed content ────────────────────────────────────────────────────────
-- The three "Story Engine Desk" posts that used to live in
-- data/mock-community.ts, now the real seed content for the live paddock.
insert into public.posts
  (id, author_display_name, author_favorite_team, category, headline, body, created_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Story Engine Desk', 'McLaren', 'Paddock Debate',
    'Which team would you trust most in a development race?',
    'Forget the current points table for a moment. Pick the team you think would make the smartest upgrades across the next six rounds—and tell the paddock why.',
    now() - interval '18 minutes'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'SectorThree', 'Mercedes', 'Hot Take',
    'Team orders should arrive earlier—not only when the title maths gets obvious.',
    'Waiting until the final third of a season can waste points. If one driver has the clearer championship route, the team should commit while the advantage still matters.',
    now() - interval '42 minutes'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'KerbWatcher', 'Red Bull', 'Race Chat',
    'What matters most in a perfect race weekend?',
    'Pole position, tyre management, clean pit stops, or adapting fastest when the race changes? Choose one—no fence-sitting.',
    now() - interval '1 hour'
  );

insert into public.comments
  (post_id, author_display_name, author_favorite_team, body, created_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'ApexMaya', 'Williams',
    'I care less about one big upgrade and more about whether every package works immediately.',
    now() - interval '9 minutes'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'LateBrakeLeo', 'Ferrari',
    'The best answer changes depending on whether the next circuits reward efficiency or downforce.',
    now() - interval '4 minutes'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'PapayaPulse', 'McLaren',
    'Only if the performance gap is consistent across different circuit types.',
    now() - interval '31 minutes'
  );

-- ── grants ──────────────────────────────────────────────────────────────
-- Required because "Automatically expose new tables" was left off. Matches
-- the RLS policies above exactly — nothing more permissive than that.
grant usage on schema public to anon, authenticated;

grant select on public.profiles, public.posts, public.comments, public.reactions
  to anon, authenticated;

grant update on public.profiles to authenticated;
grant insert on public.posts, public.comments to authenticated;
grant insert, update, delete on public.reactions to authenticated;
grant insert on public.reports to authenticated;
