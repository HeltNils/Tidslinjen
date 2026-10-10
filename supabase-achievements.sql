-- Achievements (medaljer) per bruker. Kjør i Supabase SQL Editor etter supabase-schema.sql.
create table if not exists public.achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('all', 'grade8', 'grade9', 'grade10', 'junior', 'norway', 'bce')),
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'diamond')),
  best_percent integer not null check (best_percent between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, scope)
);

alter table public.achievements drop constraint if exists achievements_tier_check;
alter table public.achievements
  add constraint achievements_tier_check check (tier in ('bronze', 'silver', 'gold', 'diamond'));

alter table public.achievements enable row level security;

drop policy if exists "Users can read their own achievements" on public.achievements;
drop policy if exists "Users can add their own achievements" on public.achievements;
drop policy if exists "Users can upgrade their own achievements" on public.achievements;

create policy "Users can read their own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can add their own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can upgrade their own achievements"
  on public.achievements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);