-- User card suggestions are private submissions and are not added to the game automatically.
create table if not exists public.card_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null check (char_length(btrim(description)) between 1 and 2000),
  image_data text check (
    image_data is null or (
      octet_length(image_data) <= 1400000 and
      image_data ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$'
    )
  ),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists card_suggestions_review
  on public.card_suggestions (status, created_at);

alter table public.card_suggestions enable row level security;

revoke all on public.card_suggestions from anon, authenticated;
grant insert (user_id, title, description, image_data) on public.card_suggestions to authenticated;

drop policy if exists "Authenticated users can submit pending card suggestions" on public.card_suggestions;
create policy "Authenticated users can submit pending card suggestions"
  on public.card_suggestions for insert to authenticated
  with check (auth.uid() = user_id and status = 'pending');

create or replace function public.is_card_suggestion_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from auth.users
    where auth.users.id = (select auth.uid())
      and lower(auth.users.email) = 'nils@tidslinjen.local'
  );
$function$;

revoke all on function public.is_card_suggestion_admin() from public, anon;
grant execute on function public.is_card_suggestion_admin() to authenticated;

grant select, delete on public.card_suggestions to authenticated;
grant update (status) on public.card_suggestions to authenticated;

drop policy if exists "Only Nils can read card suggestions" on public.card_suggestions;
create policy "Only Nils can read card suggestions"
  on public.card_suggestions for select to authenticated
  using (public.is_card_suggestion_admin());

drop policy if exists "Only Nils can accept card suggestions" on public.card_suggestions;
create policy "Only Nils can accept card suggestions"
  on public.card_suggestions for update to authenticated
  using (public.is_card_suggestion_admin())
  with check (public.is_card_suggestion_admin());

drop policy if exists "Only Nils can remove card suggestions" on public.card_suggestions;
create policy "Only Nils can remove card suggestions"
  on public.card_suggestions for delete to authenticated
  using (public.is_card_suggestion_admin());
