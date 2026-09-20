-- Run once in the Supabase SQL Editor AFTER supabase-schema.sql.
-- Safe to run again. Existing accounts/results are preserved.
-- Blocklist generated from username-bank.json by scripts/sync-username-bank.mjs.
begin;

create or replace function public.username_allowed(candidate text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(
    candidate ~ '^[[:upper:]][[:lower:]]{2,11}$'
    and lower(candidate) !~ '([[:alpha:]])\1{2}'
    and not exists (
      select 1 from unnest(array[
        'rasisme',
        'rasist',
        'homofobi',
        'homofob',
        'transfobi',
        'transfob',
        'nazist',
        'hitler',
        'terrorist',
        'terror',
        'fuck',
        'fucking',
        'jævla',
        'hore',
        'charlie',
        'kirk',
        'jefferey',
        'epstein',
        'george',
        'floyd',
        'stalin',
        'mussolini',
        'binladen',
        'nazi',
        'nigger',
        'nigga',
        'porno',
        'neger',
        'faggot',
        'fagget',
        'faggit',
        'tranny',
        'retard',
        'fitte',
        'cunt',
        'motherfucker',
        'drittsekk',
        'kuktryne',
        'jævlig',
        'pedobear',
        'childlover',
        'minorhunter',
        'kidgroomer',
        'predatorking',
        'groommaster',
        'creepyuncle',
        'schoolshooter',
        'masskiller',
        'serialkiller',
        'murderking',
        'killeveryone',
        'deathtoall',
        'bombmaker',
        'terrorking',
        'naziboy',
        'naziking',
        'hitlerfan',
        'whitepower',
        'hatemachine',
        'gasthemall',
        'burnthemall',
        'rapist',
        'rapemaster',
        'rapeking',
        'forcedsex',
        'incestking',
        'animallover69',
        'necrolover',
        'pornmaster',
        'pornking',
        'sexpredator',
        'sexoffender',
        'pervertking',
        'cummaster',
        'cumguzzler',
        'dickmaster',
        'pussydestroyer',
        'asseater',
        'cocksucker',
        'fuckface',
        'fuckyou',
        'shithead',
        'dipshit',
        'dumbfuck',
        'asshole',
        'scumbag',
        'dirtbag',
        'douchebag',
        'bastardboy',
        'sonofabitch',
        'whoremaster',
        'whorehunter',
        'slutshamer',
        'megabitch',
        'fatbastard',
        'uglyloser',
        'worthlesshuman',
        'humantrash',
        'wasteofspace',
        'braindead',
        'retardking',
        'idiotsupreme',
        'stupidmoron',
        'freakshow',
        'killyourself',
        'godie',
        'justdie',
        'kysnow',
        'suicideboy',
        'selfharmking',
        'cutyourself',
        'nobodylovesyou',
        'cancerwish',
        'hopeyoudie',
        'dieinpain',
        'chokeanddie',
        'burninhell',
        'rotinhell',
        'babykiller',
        'childkiller',
        'womanbeater',
        'wifebeater',
        'animalkiller',
        'dogkiller',
        'catkiller',
        'torturemaster',
        'gorelover',
        'blooddrinker',
        'corpseeater',
        'headcollector',
        'skincollector',
        'drugdealer',
        'methhead',
        'crackhead',
        'cokedealer',
        'heroinking',
        'junkieking',
        'drunkdriver',
        'schoolbomber',
        'churchburner',
        'mosqueburner',
        'synagogueburner',
        'slavemaster',
        'racehater',
        'gayhater',
        'womenhater',
        'disabledhater',
        'hatespeech',
        'bullyking',
        'cyberbully',
        'trollmaster',
        'doxxer',
        'stalker',
        'childstalker',
        'revengeporn',
        'nudeleaker',
        'blackmailer',
        'extortionist',
        'hackerthreat',
        'swatter',
        'scammaster',
        'fraudking',
        'identitythief',
        'creepypedo',
        'localpredator',
        'registeredoffender',
        'dungeonrapist',
        'basementkidnapper',
        'humantrafficker',
        'slavetrader',
        'organharvester',
        'cannibalking',
        'satanickiller',
        'devilrapist',
        'evilbastard',
        'sickfuck',
        'twistedfreak',
        'filthypig',
        'dirtywhore',
        'stupidbitch',
        'patheticloser',
        'crybaby',
        'nolifeloser',
        'virginloser',
        'incelking',
        'toxicmale',
        'toxicbitch',
        'fuckyourfamily',
        'fuckyourmother',
        'yourmomwhore',
        'fatherlessloser',
        'orphanmocker',
        'deadmomjokes',
        'deaddadjokes',
        'diseasespreader',
        'plaguerat',
        'cancerboy',
        'aidsdealer',
        'covidspreader',
        'schoolthreat',
        'bombthreat',
        'gunthreat',
        'deaththreat',
        'murderthreat',
        'shootthemall',
        'killthekids',
        'killtheteacher',
        'burntheschool',
        'bombtheschool',
        'executeeveryone',
        'exterminateall',
        'genocidefan',
        'ethniccleansing',
        'dictatorfan',
        'warcriminal',
        'tortureking',
        'beheadingfan',
        'goremaster',
        'corpsefucker',
        'babyraper',
        'childrapist',
        'kidnapperking',
        'groomergaming',
        'predatoronline',
        'minorcollector',
        'nudecollector',
        'underagelover',
        'jailbaithunter',
        'ageisanumber',
        'consentisfake',
        'nomeansyes',
        'forcedlove',
        'victimblamer',
        'abusemaster',
        'domesticabuser',
        'beatyourwife',
        'punchwomen',
        'bullytheweak',
        'hateeveryone',
        'destroyhumanity',
        'humanextinction',
        'deathcult',
        'suicidecult',
        'terrorsquad',
        'murdersquad',
        'nazisquad',
        'racistking',
        'homophobeking',
        'misogynyking',
        'bigotmaster',
        'supremacist',
        'extremistking'
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
