-- F1 Story Engine — anonymous-by-default usernames
-- Run once in Supabase Studio: SQL Editor → New query → paste → Run.
--
-- Problem: handle_new_user() previously set a new profile's display_name to
-- the local part of the sign-in email (e.g. "srujnil" from
-- srujnil@gmail.com) — identifying, and public the instant someone signs
-- in, before they get any chance to change it. This migration stops that,
-- resets every existing profile to an anonymous placeholder, and adds a
-- flag the UI uses to prompt people to pick a real username.

-- 1. Track whether someone has actually chosen their own display name yet.
alter table public.profiles
  add column username_set boolean not null default false;

-- 2. New sign-ups get a random, non-identifying placeholder instead of an
--    email-derived one. No pgcrypto/gen_random_uuid() dependency needed.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, 'Paddock #' || floor(random() * 9000 + 1000)::int);
  return new;
end;
$$;

-- 3. Reset every existing profile the same way, so nobody who already
--    signed in (including test accounts) is left with an identifying
--    name — they'll see the same "choose a username" prompt as new
--    sign-ups next time they're on /community.
update public.profiles
set display_name = 'Paddock #' || floor(random() * 9000 + 1000)::int,
    username_set = false;
