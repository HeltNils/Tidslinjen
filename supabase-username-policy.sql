-- Run once in the Supabase SQL Editor AFTER supabase-schema.sql.
-- Safe to run again. Existing accounts/results are preserved.
-- Keep the terms in sync with username-policy.js.
begin;

create or replace function public.username_allowed(candidate text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(
    candidate ~ '^[[:upper:]][[:alpha:]]{2,23}$'
    and not exists (
      select 1 from unnest(array[
        'rasisme', 'rasist', 'homofobi', 'homofob', 'transfobi', 'transfob',
        'nazist', 'hitler', 'terrorist', 'terror', 'fuck', 'fucking', 'jævla', 'hore',
        'charlie', 'kirk', 'jefferey', 'epstein', 'george', 'floyd',
        'stalin', 'mussolini', 'binladen', 'nazi', 'nigger', 'nigga', 'porno',
        'neger', 'faggot', 'fagget', 'faggit', 'tranny', 'retard',
        'fitte', 'cunt', 'motherfucker', 'drittsekk'
      ]) as blocked(term)
      where strpos(
        lower(regexp_replace(normalize(candidate, NFKD), U&'[\0300-\036f]', '', 'g')),
        lower(regexp_replace(normalize(term, NFKD), U&'[\0300-\036f]', '', 'g'))
      ) > 0
    ), false);
$$;

create or replace function public.enforce_account_username()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.username_allowed(new.raw_user_meta_data ->> 'username') then
    raise exception 'Dette brukernavnet er ikke tillatt. Velg et annet navn.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_account_username() from public, anon, authenticated;

drop trigger if exists enforce_account_username on auth.users;
create trigger enforce_account_username
before insert or update of raw_user_meta_data on auth.users
for each row execute function public.enforce_account_username();

-- Derive the displayed name from the stored account, never the submitted score.
create or replace function public.enforce_result_username()
returns trigger language plpgsql security definer set search_path = '' as $$
declare account_name text;
begin
  select raw_user_meta_data ->> 'username' into account_name
    from auth.users where id = new.user_id;
  if not public.username_allowed(account_name) then
    raise exception 'Dette brukernavnet er ikke tillatt.' using errcode = '23514';
  end if;
  new.username := account_name;
  return new;
end;
$$;
revoke all on function public.enforce_result_username() from public, anon, authenticated;
drop trigger if exists enforce_result_username on public.round_results;
create trigger enforce_result_username
before insert or update on public.round_results
for each row execute function public.enforce_result_username();

-- Restrictive policy also hides old unsuitable names without deleting records.
drop policy if exists "Hide unsuitable usernames" on public.round_results;
create policy "Hide unsuitable usernames" on public.round_results
  as restrictive for select to anon, authenticated
  using (public.username_allowed(username));

commit;
