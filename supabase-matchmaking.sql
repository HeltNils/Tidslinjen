-- Separate, server-validated matchmaking and duel ratings.
-- Run this file in the Supabase SQL editor. The generated card catalogue must
-- stay in sync with events.js; check it with scripts/sync-duel-card-bank.mjs.

create table if not exists public.duel_cards (
  card_id text primary key,
  title text not null,
  year integer not null check (year <> 0 and year between -1000000 and 1000000),
  difficulty smallint not null check (difficulty between 1 and 3),
  timeline_date text
);

alter table public.duel_cards enable row level security;
revoke all on public.duel_cards from anon, authenticated;

-- BEGIN GENERATED DUEL CARD CATALOG
insert into public.duel_cards (card_id, title, year, difficulty, timeline_date)
values
  ('TWH11', 'Det første palasset i Knossos bygges', -1900, 2, null),
  ('TWH12', 'Monumentanlegget Poverty Point vokser fram', -1700, 3, null),
  ('TWH13', 'Den olmekiske kulturen vokser fram', -1400, 2, null),
  ('TWH14', 'Akhenaton grunnlegger byen Akhetaten', -1347, 2, null),
  ('TWH15', 'Kinesisk skrift brukes på orakelbein', -1300, 2, null),
  ('TWH16', 'Egyptere og hettitter møtes i slaget ved Kadesj', -1274, 2, null),
  ('TWH3', 'Vogner med hjul tas i bruk', -3500, 2, null),
  ('TWH4', 'Uruk blir en storby', -3200, 2, null),
  ('TWH5', 'Hieroglyfer tas i bruk i Egypt', -3200, 1, null),
  ('TWH6', 'Djosers trappepyramide bygges', -2650, 1, null),
  ('TWH7', 'Keopspyramiden bygges', -2570, 1, null),
  ('TWH8', 'De store steinene ved Stonehenge reises', -2500, 1, null),
  ('TWH9', 'Sargon bygger det akkadiske riket', -2300, 2, null),
  ('TWH10', 'Solvognen fra Trundholm blir laget', -1400, 2, null),
  ('U1', 'Muhammed utvandrer fra Mekka til Medina', 622, 2, null),
  ('U2', 'Magnus Lagabøtes landslov innføres', 1274, 2, null),
  ('U3', 'Newton utgir Principia', 1687, 2, null),
  ('U4', 'Darwin utgir Artenes opprinnelse', 1859, 1, null),
  ('U5', 'Kvinner får begrenset stemmerett ved kommunevalg', 1901, 2, null),
  ('U6', 'Amundsens ekspedisjon når Sydpolen', 1911, 1, null),
  ('U7', 'FNs verdenserklæring om menneskerettigheter vedtas', 1948, 1, null),
  ('U8', 'Oslo arrangerer vinter-OL', 1952, 1, null),
  ('U9', 'Fjernsynet åpner offisielt i Norge', 1960, 2, null),
  ('U10', 'Ekofiskfeltet blir oppdaget', 1969, 1, null),
  ('U11', 'Gro Harlem Brundtland blir Norges første kvinnelige statsminister', 1981, 1, null),
  ('U12', 'Sovjetunionen oppløses', 1991, 1, null),
  ('U13', 'Norge sier nei til EU-medlemskap', 1994, 1, null),
  ('U14', 'Lillehammer arrangerer vinter-OL', 1994, 1, null),
  ('TWH1', 'Bosettingen Çatalhöyük vokser fram', -7400, 3, null),
  ('TWH2', 'Den båndkeramiske kulturen vokser fram', -5500, 3, null),
  ('G1', 'Jordbruksrevolusjonen (den neolittiske revolusjonen)', -10000, 1, null),
  ('G2', 'Skrift tas i bruk i Mesopotamia', -3000, 1, null),
  ('G3', 'Vestromerriket faller', 476, 1, null),
  ('G4', 'Vikingangrepet på Lindisfarne', 793, 1, null),
  ('G5', 'Slaget i Hafrsfjord', 872, 1, null),
  ('G6', 'Olav Tryggvason blir konge og fremmer kristningen', 995, 2, null),
  ('G7', 'Slaget på Stiklestad', 1030, 1, null),
  ('G8', 'Erkebispesetet i Nidaros opprettes', 1152, 3, null),
  ('G9', 'Magnus Erlingsson krones til konge', 1163, 3, null),
  ('G10', 'Sverre blir konge for birkebeinerne', 1177, 3, null),
  ('G11', 'Magna Carta undertegnes', 1215, 2, null),
  ('G12', 'Norgesveldet når sin største utstrekning', 1263, 3, null),
  ('G13', 'Den norske kongeslekten dør ut på mannssiden', 1319, 3, null),
  ('G14', 'Svartedauden rammer Norge', 1349, 1, null),
  ('G15', 'Kalmarunionen opprettes', 1397, 2, null),
  ('G16', 'Boktrykkerkunsten slår gjennom i Europa', 1450, 1, null),
  ('G17', 'Reformasjonen innføres i Danmark-Norge', 1536, 2, null),
  ('G18', 'Danmark-Norge avstår Jämtland og Herjedalen', 1645, 3, null),
  ('G19', 'Norge mister Båhuslen og Trondhjems len', 1658, 3, null),
  ('G20', 'Eneveldet innføres i Danmark-Norge', 1660, 3, null),
  ('G21', 'Den franske revolusjonen begynner', 1789, 1, null),
  ('G22', 'Norge får Grunnloven', 1814, 1, null),
  ('G23', 'Norges Bank opprettes', 1816, 3, null),
  ('G24', 'Kommunalt selvstyre innføres', 1837, 3, null),
  ('G25', 'Espressomaskinen finnes opp', 1884, 3, null),
  ('G26', 'Parlamentarismen innføres i Norge', 1884, 2, null),
  ('G27', 'Unionen med Sverige oppløses', 1905, 1, null),
  ('G28', 'Kvinner får alminnelig stemmerett', 1913, 1, null),
  ('G29', 'Første verdenskrig begynner', 1914, 1, null),
  ('G30', 'Arbeiderpartiet danner sin første regjering', 1928, 3, null),
  ('G31', 'Tyskland angriper og okkuperer Norge', 1940, 1, '1940-04-09'),
  ('G32', 'Andre verdenskrig tar slutt', 1945, 1, '1945-09-02'),
  ('G33', 'Norge blir medlem av NATO', 1949, 1, null),
  ('G34', 'Mennesket lander på månen', 1969, 1, null),
  ('G35', 'Norge sier nei til EF', 1972, 2, null),
  ('G36', 'Berlinmuren faller', 1989, 1, null),
  ('G37', 'World Wide Web blir offentlig tilgjengelig', 1991, 1, null),
  ('G38', 'Terrorangrepene 22. juli', 2011, 1, null),
  ('N1', 'Jeriko, en av verdens eldste byer, grunnlegges', -7000, 3, null),
  ('N2', 'Egypt samles til ett rike', -3100, 3, null),
  ('N3', 'Induskulturen oppstår', -2500, 3, null),
  ('N4', 'Hammurabi samler Babylonia', -1700, 3, null),
  ('N5', 'Roma grunnlegges', -753, 3, null),
  ('N6', 'Demokratiet vokser fram i Athen', -500, 2, null),
  ('N7', 'Perserkrigene', -490, 3, null),
  ('N8', 'Aleksander den store erobrer et enormt rike', -334, 2, null),
  ('N9', 'De puniske krigene mellom Roma og Karthago', -264, 3, null),
  ('N10', 'Arbeidet med Den kinesiske mur fullføres under Shi Huangdi', -214, 3, null),
  ('N11', 'Silkeveien knytter Kina og Vesten sammen', -150, 3, null),
  ('N12', 'Kristendommen begynner å spre seg i Romerriket', 30, 1, null),
  ('N13', 'Romerriket når sin største utstrekning', 117, 2, null),
  ('N14', 'Romerriket deles i et vestlig og et østlig rike', 395, 3, null),
  ('N15', 'Frankerriket grunnlegges under Chlodvig', 486, 3, null),
  ('N16', 'Muhammed dør og den islamske ekspansjonen begynner', 632, 2, null),
  ('N17', 'Karl den store krones til keiser', 800, 3, null),
  ('N18', 'Det tysk-romerske riket blir til', 962, 3, null),
  ('N19', 'Norrøne ferder når Nord-Amerika/Vinland', 1000, 1, null),
  ('N20', 'Det store skisma: østkirken og vestkirken skilles', 1054, 3, null),
  ('N21', 'Normannerne erobrer England', 1066, 2, null),
  ('N22', 'Det første korstoget', 1096, 2, null),
  ('N23', 'Mongolene invaderer Polen, Ungarn og Böhmen', 1241, 3, null),
  ('N24', 'Mali-rikets blomstringstid', 1250, 3, null),
  ('N25', 'Hundreårskrigen mellom England og Frankrike', 1337, 3, null),
  ('N26', 'Svartedauden kommer til Europa', 1347, 1, null),
  ('N27', 'Ming-dynastiet kommer til makten i Kina', 1368, 3, null),
  ('N28', 'Inkaene bygger opp en stormakt i Sør-Amerika', 1400, 3, null),
  ('N29', 'Konstantinopel erobres av osmanene', 1453, 3, null),
  ('N30', 'Kristoffer Columbus når Amerika', 1492, 1, null),
  ('N31', 'Vasco da Gama når India sjøveien', 1498, 2, null),
  ('N32', 'Martin Luther offentliggjør de 95 tesene', 1517, 3, null),
  ('N33', 'Den første jordomseilingen', 1519, 1, null),
  ('N34', 'Pizarro begynner erobringen av Inkariket', 1531, 3, null),
  ('N35', 'Den spanske armada blir beseiret', 1588, 3, null),
  ('N36', 'Tokugawa-shogunatet etableres i Japan', 1603, 3, null),
  ('N37', 'Jamestown grunnlegges', 1607, 3, null),
  ('N38', 'Trettiårskrigen', 1618, 2, null),
  ('N39', 'England blir et konstitusjonelt monarki', 1688, 2, null),
  ('N40', 'Sjuårskrigen', 1756, 2, null),
  ('N41', 'Den industrielle revolusjonen begynner i England', 1770, 1, null),
  ('N42', 'USA erklærer seg uavhengig', 1776, 1, null),
  ('N43', 'Haiti blir selvstendig', 1804, 3, null),
  ('N44', 'Napoleon beseires og Wienkongressen samles', 1815, 2, null),
  ('N45', 'Slaveriet forbys i de britiske koloniene', 1833, 2, null),
  ('N46', 'Kina avstår Hongkong til Storbritannia etter opiumskrigen', 1842, 3, null),
  ('N47', 'Den amerikanske borgerkrigen', 1861, 2, null),
  ('N48', 'Meiji-restaurasjonen begynner i Japan', 1868, 3, null),
  ('N49', 'Suezkanalen åpnes', 1869, 3, null),
  ('N50', 'Tyskland samles til ett keiserrike', 1871, 3, null),
  ('N51', 'Berlinkonferansen og kappløpet om Afrika', 1884, 3, null),
  ('N52', 'Den russiske revolusjonen', 1917, 2, null),
  ('N53', 'Børskrakket i New York utløser økonomisk verdenskrise', 1929, 1, null),
  ('N54', 'Hitler blir rikskansler i Tyskland', 1933, 1, null),
  ('N55', 'Andre verdenskrig begynner', 1939, 1, '1939-09-01'),
  ('N56', 'FN opprettes', 1945, 1, '1945-10-24'),
  ('N57', 'India og Pakistan blir selvstendige', 1947, 2, null),
  ('N58', 'Koreakrigen begynner', 1950, 2, null),
  ('N59', 'Sputnik skytes opp', 1957, 2, null),
  ('N60', 'Berlinmuren bygges', 1961, 1, null),
  ('N61', 'Cubakrisen', 1962, 2, null),
  ('N62', 'USA sender kamptropper til Vietnam', 1965, 2, null),
  ('N63', 'Tsjernobylulykken', 1986, 2, null),
  ('N64', 'Apartheid avskaffes og Nelson Mandela blir president', 1994, 2, null),
  ('N65', 'Terrorangrepene 11. september', 2001, 1, null),
  ('N66', 'Russland annekterer Krim', 2014, 1, null),
  ('N67', 'Russland invaderer Ukraina', 2022, 1, null),
  ('UT2', 'Den industrielle revolusjonen treffer Norge', 1840, 2, null),
  ('UT3', 'Trekanthandelen', 1650, 2, null),
  ('UT4', 'Den transatlantiske slavehandelen begynner', 1501, 2, null),
  ('UT5', 'Fornorskingspolitikken overfor samer og kvener', 1850, 2, null),
  ('UT6', 'Opplysningstiden', 1750, 2, null),
  ('UT7', 'ENIAC – den første store elektroniske datamaskinen', 1946, 3, null),
  ('UT8', 'iPhone lanseres', 2007, 2, null),
  ('UT9', 'ChatGPT lanseres', 2022, 1, null),
  ('UT10', 'Napoleonskrigene begynner', 1803, 2, null),
  ('UT11', 'Det kommunistiske manifest utgis', 1848, 2, null),
  ('UT12', 'Mussolini får makten i Italia', 1922, 2, null),
  ('UT13', 'Første verdenskrig tar slutt', 1918, 1, null),
  ('UT14', 'Skuddene i Sarajevo', 1914, 2, null),
  ('UT15', 'Versaillestraktaten undertegnes', 1919, 2, null),
  ('UT16', 'Tyskland får Sudetenland fra Tsjekkoslovakia', 1938, 3, null),
  ('UT17', 'Tyskland invaderer Polen', 1939, 1, '1939-09-01'),
  ('UT18', 'Frankrike og Storbritannia erklærer Tyskland krig', 1939, 2, '1939-09-03'),
  ('UT19', 'Aksemaktene knyttes sammen i Tripartittpakten', 1940, 3, '1940-09-27'),
  ('UT20', 'De allierte undertegner FNs erklæring', 1942, 3, '1942-01-01'),
  ('UT21', 'Krystallnatten', 1938, 2, '1938-11-09'),
  ('UT22', 'Operasjon Barbarossa', 1941, 2, '1941-06-22'),
  ('UT23', 'Tyskland bryter ikke-angrepspakten med Sovjetunionen', 1941, 3, '1941-06-22'),
  ('UT24', 'Angrepet på Pearl Harbor', 1941, 1, '1941-12-07'),
  ('UT25', 'Slaget ved Stalingrad', 1942, 2, '1942-08-23'),
  ('UT26', 'Slaget ved El Alamein', 1942, 3, null),
  ('UT27', 'D-dagen', 1944, 1, '1944-06-06'),
  ('UT28', 'Tyskland kapitulerer', 1945, 2, '1945-05-07'),
  ('UT29', 'Freden kommer til Norge', 1945, 1, '1945-05-08'),
  ('UT30', 'Atombomben over Hiroshima', 1945, 1, '1945-08-06'),
  ('UT31', 'Atombomben over Nagasaki', 1945, 1, '1945-08-09'),
  ('UT32', 'Vinterkrigen begynner', 1939, 2, '1939-11-30'),
  ('UT33', 'Jaltakonferansen', 1945, 2, '1945-02-04'),
  ('UT34', 'Kampen om tungtvannet', 1943, 2, '1943-02-28'),
  ('UT35', 'Slaget om Narvik', 1940, 2, '1940-04-09'),
  ('UT36', 'Krysseren «Blücher» senkes', 1940, 2, '1940-04-09'),
  ('UT37', 'Folketrygden innføres – velferdsstaten bygges ut', 1967, 2, null),
  ('UT38', 'Høyesterett avgjør klimasøksmålet om oljeleting', 2020, 3, null),
  ('UT39', 'Terrorangrepet i Oslo 25. juni', 2022, 2, null),
  ('UT40', 'Drapet på Tamima Nibras Juhar', 2025, 3, null),
  ('UT41', 'Den kalde krigen begynner', 1947, 1, null),
  ('UT42', 'Hamas angriper Israel 7. oktober', 2023, 2, null),
  ('UT43', 'Staten Israel opprettes', 1948, 1, null),
  ('UT44', 'Warszawapakten dannes', 1955, 2, null),
  ('UT45', 'Koreakrigen tar slutt', 1953, 2, null),
  ('UT46', 'Vietnamkrigen tar slutt', 1975, 2, null),
  ('UT47', 'Trumandoktrinen', 1947, 3, null),
  ('UT48', 'Jernteppet dannes', 1946, 2, null),
  ('UT49', 'Sovjetunionen sprenger sin første atombombe', 1949, 3, null),
  ('UT50', 'Marshallplanen', 1948, 2, null),
  ('U15', 'Tananger ungdomsskole åpner', 1976, 1, null)
on conflict (card_id) do update set
  title = excluded.title,
  year = excluded.year,
  difficulty = excluded.difficulty,
  timeline_date = excluded.timeline_date;

delete from public.duel_cards
where card_id not in ('TWH11', 'TWH12', 'TWH13', 'TWH14', 'TWH15', 'TWH16', 'TWH3', 'TWH4', 'TWH5', 'TWH6', 'TWH7', 'TWH8', 'TWH9', 'TWH10', 'U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'TWH1', 'TWH2', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17', 'G18', 'G19', 'G20', 'G21', 'G22', 'G23', 'G24', 'G25', 'G26', 'G27', 'G28', 'G29', 'G30', 'G31', 'G32', 'G33', 'G34', 'G35', 'G36', 'G37', 'G38', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16', 'N17', 'N18', 'N19', 'N20', 'N21', 'N22', 'N23', 'N24', 'N25', 'N26', 'N27', 'N28', 'N29', 'N30', 'N31', 'N32', 'N33', 'N34', 'N35', 'N36', 'N37', 'N38', 'N39', 'N40', 'N41', 'N42', 'N43', 'N44', 'N45', 'N46', 'N47', 'N48', 'N49', 'N50', 'N51', 'N52', 'N53', 'N54', 'N55', 'N56', 'N57', 'N58', 'N59', 'N60', 'N61', 'N62', 'N63', 'N64', 'N65', 'N66', 'N67', 'UT2', 'UT3', 'UT4', 'UT5', 'UT6', 'UT7', 'UT8', 'UT9', 'UT10', 'UT11', 'UT12', 'UT13', 'UT14', 'UT15', 'UT16', 'UT17', 'UT18', 'UT19', 'UT20', 'UT21', 'UT22', 'UT23', 'UT24', 'UT25', 'UT26', 'UT27', 'UT28', 'UT29', 'UT30', 'UT31', 'UT32', 'UT33', 'UT34', 'UT35', 'UT36', 'UT37', 'UT38', 'UT39', 'UT40', 'UT41', 'UT42', 'UT43', 'UT44', 'UT45', 'UT46', 'UT47', 'UT48', 'UT49', 'UT50', 'U15');
-- END GENERATED DUEL CARD CATALOG

create table if not exists public.duel_ratings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rating integer not null default 1000,
  matches integer not null default 0 check (matches >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  draws integer not null default 0 check (draws >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.duel_rooms (
  id uuid primary key default gen_random_uuid(),
  rated boolean not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  player_one_id uuid not null references auth.users(id) on delete cascade,
  player_two_id uuid not null references auth.users(id) on delete cascade,
  player_one_name text not null,
  player_two_name text not null,
  player_one_rating integer not null,
  player_two_rating integer not null,
  current_turn_id uuid,
  current_card_id text,
  starter_card_id text,
  remaining_cards text[] not null default '{}',
  timeline_cards text[] not null,
  turn_deadline timestamptz,
  player_one_lives smallint not null default 3 check (player_one_lives between 0 and 3),
  player_two_lives smallint not null default 3 check (player_two_lives between 0 and 3),
  player_one_points integer not null default 0 check (player_one_points >= 0),
  player_two_points integer not null default 0 check (player_two_points >= 0),
  player_one_correct integer not null default 0 check (player_one_correct >= 0),
  player_one_wrong integer not null default 0 check (player_one_wrong >= 0),
  player_two_correct integer not null default 0 check (player_two_correct >= 0),
  player_two_wrong integer not null default 0 check (player_two_wrong >= 0),
  winner_id uuid references auth.users(id) on delete set null,
  elo_delta_one integer,
  elo_delta_two integer,
  last_move jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  check (player_one_id <> player_two_id),
  check ((status = 'active' and current_turn_id is not null and turn_deadline is not null) or
    (status = 'completed' and current_turn_id is null and turn_deadline is null))
);

alter table public.duel_rooms add column if not exists starter_card_id text;

with missing_starters as (
  select rooms.id,
    (
      select cards.card_id
      from public.duel_cards cards
      where cards.card_id <> rooms.current_card_id
        and not (cards.card_id = any(rooms.remaining_cards))
        and not (cards.card_id = any(rooms.timeline_cards))
      order by random()
      limit 1
    ) as fallback_starter_card_id
  from public.duel_rooms rooms
  where rooms.status = 'active'
    and (cardinality(rooms.timeline_cards) = 0
      or (rooms.starter_card_id is null and rooms.last_move is null
        and cardinality(rooms.timeline_cards) = 1))
)
update public.duel_rooms rooms
set starter_card_id = coalesce(rooms.timeline_cards[1], missing.fallback_starter_card_id),
    timeline_cards = case when cardinality(rooms.timeline_cards) = 0
      then array[missing.fallback_starter_card_id] else rooms.timeline_cards end
from missing_starters missing
where rooms.id = missing.id
  and coalesce(rooms.timeline_cards[1], missing.fallback_starter_card_id) is not null;

create index if not exists duel_rooms_active_players
  on public.duel_rooms (player_one_id, player_two_id, created_at desc)
  where status = 'active';

create table if not exists public.duel_queue (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rating_at_join integer not null,
  status text not null default 'waiting' check (status in ('waiting', 'matched')),
  room_id uuid references public.duel_rooms(id) on delete set null,
  joined_at timestamptz not null default now(),
  check ((status = 'waiting' and room_id is null) or (status = 'matched' and room_id is not null))
);

create index if not exists duel_queue_waiting
  on public.duel_queue (joined_at, rating_at_join)
  where status = 'waiting';

create table if not exists public.duel_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  inviter_name text not null,
  invitee_name text not null,
  rated boolean not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  room_id uuid references public.duel_rooms(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (inviter_id <> invitee_id)
);

create unique index if not exists duel_invites_one_pending
  on public.duel_invites (inviter_id, invitee_id)
  where status = 'pending';
create index if not exists duel_invites_inbox
  on public.duel_invites (invitee_id, status, expires_at);

alter table public.duel_ratings enable row level security;
alter table public.duel_rooms enable row level security;
alter table public.duel_queue enable row level security;
alter table public.duel_invites enable row level security;

revoke all on public.duel_ratings, public.duel_rooms, public.duel_queue, public.duel_invites
  from anon, authenticated;
grant select on public.duel_ratings, public.duel_rooms, public.duel_queue, public.duel_invites
  to authenticated;

drop policy if exists "Players can read their own duel rating" on public.duel_ratings;
create policy "Players can read their own duel rating"
  on public.duel_ratings for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Participants can read their duel rooms" on public.duel_rooms;
create policy "Participants can read their duel rooms"
  on public.duel_rooms for select to authenticated
  using ((select auth.uid()) in (player_one_id, player_two_id));

drop policy if exists "Players can read their own matchmaking entry" on public.duel_queue;
create policy "Players can read their own matchmaking entry"
  on public.duel_queue for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Invite participants can read their invitations" on public.duel_invites;
create policy "Invite participants can read their invitations"
  on public.duel_invites for select to authenticated
  using ((select auth.uid()) in (inviter_id, invitee_id));

create or replace function public._duel_compare_cards(p_left text, p_right text)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_left public.duel_cards%rowtype;
  v_right public.duel_cards%rowtype;
begin
  select * into v_left from public.duel_cards where card_id = p_left;
  select * into v_right from public.duel_cards where card_id = p_right;
  if v_left.card_id is null or v_right.card_id is null then
    raise exception 'Et av tidslinjekortene finnes ikke.';
  end if;
  if v_left.year < v_right.year then return -1; end if;
  if v_left.year > v_right.year then return 1; end if;
  if v_left.timeline_date is not null and v_right.timeline_date is not null then
    if v_left.timeline_date < v_right.timeline_date then return -1; end if;
    if v_left.timeline_date > v_right.timeline_date then return 1; end if;
  end if;
  return 0;
end;
$function$;

create or replace function public._duel_create_room(p_player_one uuid, p_player_two uuid, p_rated boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_deck text[];
  v_room_id uuid;
  v_player_one_name text;
  v_player_two_name text;
  v_player_one_rating integer;
  v_player_two_rating integer;
  v_first_turn uuid;
begin
  perform pg_advisory_xact_lock(823741, 1);
  if p_player_one = p_player_two then
    raise exception 'Du kan ikke spille mot deg selv.';
  end if;
  if exists (
    select 1 from public.duel_rooms
    where status = 'active' and
      (player_one_id in (p_player_one, p_player_two) or player_two_id in (p_player_one, p_player_two))
  ) then
    raise exception 'En av spillerne er allerede i en aktiv kamp.';
  end if;

  insert into public.duel_ratings (user_id) values (p_player_one), (p_player_two)
    on conflict (user_id) do nothing;
  select rating into v_player_one_rating from public.duel_ratings where user_id = p_player_one;
  select rating into v_player_two_rating from public.duel_ratings where user_id = p_player_two;
  select coalesce(nullif(btrim(raw_user_meta_data ->> 'username'), ''), split_part(email, '@', 1))
    into v_player_one_name from auth.users where id = p_player_one;
  select coalesce(nullif(btrim(raw_user_meta_data ->> 'username'), ''), split_part(email, '@', 1))
    into v_player_two_name from auth.users where id = p_player_two;

  select array_agg(card_id order by random()) into v_deck
  from (select card_id from public.duel_cards order by random() limit 40) as selected_cards;
  if coalesce(array_length(v_deck, 1), 0) < 4 then
    raise exception 'Kortbanken for dueller er ikke klargjort ennå.';
  end if;

  v_first_turn := case when random() < 0.5 then p_player_one else p_player_two end;
  insert into public.duel_rooms (
    rated, player_one_id, player_two_id, player_one_name, player_two_name,
    player_one_rating, player_two_rating, current_turn_id, current_card_id, starter_card_id,
    remaining_cards, timeline_cards, turn_deadline
  ) values (
    p_rated, p_player_one, p_player_two, v_player_one_name, v_player_two_name,
    v_player_one_rating, v_player_two_rating, v_first_turn, v_deck[2], v_deck[1],
    v_deck[3:array_length(v_deck, 1)], array[v_deck[1]], now() + interval '60 seconds'
  ) returning id into v_room_id;

  return v_room_id;
end;
$function$;

create or replace function public._duel_finish_room(p_room_id uuid, p_winner_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_room public.duel_rooms%rowtype;
  v_rating_one integer;
  v_rating_two integer;
  v_result_one numeric;
  v_expected_one numeric;
  v_delta_one integer;
  v_delta_two integer;
begin
  select * into v_room from public.duel_rooms where id = p_room_id for update;
  if v_room.id is null or v_room.status <> 'active' then return; end if;
  if p_winner_id is not null and p_winner_id not in (v_room.player_one_id, v_room.player_two_id) then
    raise exception 'Ugyldig kampvinner.';
  end if;

  if v_room.rated then
    select rating into v_rating_one from public.duel_ratings where user_id = v_room.player_one_id for update;
    select rating into v_rating_two from public.duel_ratings where user_id = v_room.player_two_id for update;
    v_result_one := case
      when p_winner_id = v_room.player_one_id then 1
      when p_winner_id = v_room.player_two_id then 0
      else 0.5
    end;
    v_expected_one := 1 / (1 + power(10::numeric, (v_rating_two - v_rating_one)::numeric / 400));
    v_delta_one := floor(32 * (v_result_one - v_expected_one) + 0.5)::integer;
    v_delta_two := -v_delta_one;
    update public.duel_ratings set rating = rating + v_delta_one,
      matches = matches + 1,
      wins = wins + case when p_winner_id = v_room.player_one_id then 1 else 0 end,
      losses = losses + case when p_winner_id = v_room.player_two_id then 1 else 0 end,
      draws = draws + case when p_winner_id is null then 1 else 0 end,
      updated_at = now()
      where user_id = v_room.player_one_id;
    update public.duel_ratings set rating = rating + v_delta_two,
      matches = matches + 1,
      wins = wins + case when p_winner_id = v_room.player_two_id then 1 else 0 end,
      losses = losses + case when p_winner_id = v_room.player_one_id then 1 else 0 end,
      draws = draws + case when p_winner_id is null then 1 else 0 end,
      updated_at = now()
      where user_id = v_room.player_two_id;
  end if;

  update public.duel_rooms set status = 'completed', winner_id = p_winner_id,
    current_turn_id = null, turn_deadline = null, finished_at = now(),
    elo_delta_one = v_delta_one, elo_delta_two = v_delta_two
    where id = p_room_id;
  delete from public.duel_queue where room_id = p_room_id;
end;
$function$;

create or replace function public.duel_my_rating()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_rating public.duel_ratings%rowtype;
begin
  if v_user_id is null then raise exception 'Du må være logget inn.'; end if;
  insert into public.duel_ratings (user_id) values (v_user_id) on conflict (user_id) do nothing;
  select * into v_rating from public.duel_ratings where user_id = v_user_id;
  return jsonb_build_object('rating', v_rating.rating, 'matches', v_rating.matches,
    'wins', v_rating.wins, 'losses', v_rating.losses, 'draws', v_rating.draws);
end;
$function$;

create or replace function public.duel_my_active_room()
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_room public.duel_rooms%rowtype;
  v_starter_card_id text;
begin
  if v_user_id is null then raise exception 'Du må være logget inn.'; end if;
  select * into v_room from public.duel_rooms
    where status = 'active' and v_user_id in (player_one_id, player_two_id)
    order by created_at desc limit 1 for update;
  if v_room.id is null then return null; end if;
  if cardinality(v_room.timeline_cards) = 0 then
    select card_id into v_starter_card_id
    from public.duel_cards
    where card_id <> v_room.current_card_id
      and not (card_id = any(v_room.remaining_cards))
    order by random()
    limit 1;
    if v_starter_card_id is null then
      raise exception 'Fant ikke et startkort til tidslinjen.';
    end if;
    update public.duel_rooms
      set starter_card_id = v_starter_card_id, timeline_cards = array[v_starter_card_id]
      where id = v_room.id;
  elsif v_room.starter_card_id is null and v_room.last_move is null
      and cardinality(v_room.timeline_cards) = 1 then
    update public.duel_rooms
      set starter_card_id = v_room.timeline_cards[1]
      where id = v_room.id;
  end if;
  perform public.duel_timeout(v_room.id);
  return v_room.id;
end;
$function$;

create or replace function public.duel_queue_join()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_rating integer;
  v_room_id uuid;
  v_own public.duel_queue%rowtype;
  v_opponent public.duel_queue%rowtype;
begin
  if v_user_id is null then raise exception 'Du må være logget inn.'; end if;
  perform pg_advisory_xact_lock(823741, 1);
  select id into v_room_id from public.duel_rooms
    where status = 'active' and v_user_id in (player_one_id, player_two_id)
    order by created_at desc limit 1;
  if v_room_id is not null then
    return jsonb_build_object('status', 'matched', 'room_id', v_room_id);
  end if;

  insert into public.duel_ratings (user_id) values (v_user_id) on conflict (user_id) do nothing;
  select rating into v_rating from public.duel_ratings where user_id = v_user_id;
  delete from public.duel_queue where status = 'waiting' and joined_at < now() - interval '15 minutes';
  select * into v_own from public.duel_queue where user_id = v_user_id for update;
  if v_own.status = 'matched' and v_own.room_id is not null then
    select id into v_room_id from public.duel_rooms where id = v_own.room_id and status = 'active';
    if v_room_id is not null then
      return jsonb_build_object('status', 'matched', 'room_id', v_room_id);
    end if;
    delete from public.duel_queue where user_id = v_user_id;
  end if;
  if not found or v_own.status = 'matched' then
    insert into public.duel_queue (user_id, rating_at_join, status, room_id, joined_at)
      values (v_user_id, v_rating, 'waiting', null, now())
      on conflict (user_id) do update set rating_at_join = excluded.rating_at_join,
        status = 'waiting', room_id = null, joined_at = now();
  end if;

  select * into v_opponent from public.duel_queue
    where user_id <> v_user_id and status = 'waiting'
    order by abs(rating_at_join - v_rating), joined_at
    limit 1 for update skip locked;
  if v_opponent.user_id is null then
    return jsonb_build_object('status', 'waiting');
  end if;

  v_room_id := public._duel_create_room(v_opponent.user_id, v_user_id, true);
  update public.duel_queue set status = 'matched', room_id = v_room_id
    where user_id in (v_user_id, v_opponent.user_id);
  return jsonb_build_object('status', 'matched', 'room_id', v_room_id);
end;
$function$;

create or replace function public.duel_queue_leave()
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then raise exception 'Du må være logget inn.'; end if;
  delete from public.duel_queue
    where user_id = (select auth.uid()) and status = 'waiting';
end;
$function$;

create or replace function public.duel_send_invite(p_username text, p_rated boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_target_id uuid;
  v_sender_name text;
  v_target_name text;
  v_invite_id uuid;
begin
  if v_user_id is null then raise exception 'Du må være logget inn.'; end if;
  if p_username is null or length(btrim(p_username)) not between 3 and 24 then
    raise exception 'Skriv inn et gyldig brukernavn.';
  end if;
  select coalesce(nullif(btrim(raw_user_meta_data ->> 'username'), ''), split_part(email, '@', 1))
    into v_sender_name from auth.users where id = v_user_id;
  select id, coalesce(nullif(btrim(raw_user_meta_data ->> 'username'), ''), split_part(email, '@', 1))
    into v_target_id, v_target_name
    from auth.users
    where lower(coalesce(nullif(btrim(raw_user_meta_data ->> 'username'), ''), split_part(email, '@', 1))) =
      lower(btrim(p_username))
    limit 1;
  if v_target_id is null then raise exception 'Fant ingen spiller med det brukernavnet.'; end if;
  if v_target_id = v_user_id then raise exception 'Du kan ikke invitere deg selv.'; end if;
  if exists (select 1 from public.duel_rooms where status = 'active' and
      (v_user_id in (player_one_id, player_two_id) or v_target_id in (player_one_id, player_two_id))) then
    raise exception 'En av spillerne er allerede i en aktiv kamp.';
  end if;
  update public.duel_invites set status = 'expired'
    where inviter_id = v_user_id and invitee_id = v_target_id
      and status = 'pending' and expires_at <= now();
  if exists (select 1 from public.duel_invites
      where inviter_id = v_user_id and status = 'pending' and expires_at > now()) then
    raise exception 'Du har allerede en ventende invitasjon.';
  end if;
  insert into public.duel_invites
    (inviter_id, invitee_id, inviter_name, invitee_name, rated, expires_at)
    values (v_user_id, v_target_id, v_sender_name, v_target_name, coalesce(p_rated, true), now() + interval '10 minutes')
    returning id into v_invite_id;
  return jsonb_build_object('invite_id', v_invite_id, 'invitee_name', v_target_name,
    'rated', coalesce(p_rated, true), 'expires_at', now() + interval '10 minutes');
end;
$function$;

create or replace function public.duel_invite_respond(p_invite_id uuid, p_accept boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_invite public.duel_invites%rowtype;
  v_room_id uuid;
begin
  if v_user_id is null then raise exception 'Du må være logget inn.'; end if;
  select * into v_invite from public.duel_invites where id = p_invite_id for update;
  if v_invite.id is null or v_invite.invitee_id <> v_user_id then
    raise exception 'Invitasjonen finnes ikke.';
  end if;
  if v_invite.status <> 'pending' then raise exception 'Invitasjonen er allerede behandlet.'; end if;
  if v_invite.expires_at <= now() then
    update public.duel_invites set status = 'expired' where id = p_invite_id;
    return jsonb_build_object('status', 'expired');
  end if;
  if not p_accept then
    update public.duel_invites set status = 'declined' where id = p_invite_id;
    return jsonb_build_object('status', 'declined');
  end if;
  if exists (select 1 from public.duel_rooms where status = 'active' and
      (v_user_id in (player_one_id, player_two_id) or v_invite.inviter_id in (player_one_id, player_two_id))) then
    raise exception 'En av spillerne er allerede i en aktiv kamp.';
  end if;
  delete from public.duel_queue where user_id in (v_user_id, v_invite.inviter_id) and status = 'waiting';
  v_room_id := public._duel_create_room(v_invite.inviter_id, v_user_id, v_invite.rated);
  update public.duel_invites set status = 'accepted', room_id = v_room_id where id = p_invite_id;
  return jsonb_build_object('status', 'matched', 'room_id', v_room_id);
end;
$function$;

create or replace function public._duel_submit_action(p_room_id uuid, p_position integer, p_timeout boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_room public.duel_rooms%rowtype;
  v_event public.duel_cards%rowtype;
  v_item record;
  v_is_one boolean;
  v_correct boolean := false;
  v_lives_one integer;
  v_lives_two integer;
  v_points_one integer;
  v_points_two integer;
  v_correct_one integer;
  v_wrong_one integer;
  v_correct_two integer;
  v_wrong_two integer;
  v_score_delta integer := 0;
  v_distance integer := 2147483647;
  v_rate numeric := 0;
  v_base integer;
  v_bonus integer;
  v_new_timeline text[];
  v_next_card text;
  v_remaining text[];
  v_next_turn uuid;
  v_finished boolean;
  v_winner uuid;
  v_last_move jsonb;
begin
  if v_user_id is null then raise exception 'Du må være logget inn.'; end if;
  select * into v_room from public.duel_rooms where id = p_room_id for update;
  if v_room.id is null or v_user_id not in (v_room.player_one_id, v_room.player_two_id) then
    raise exception 'Du har ikke tilgang til denne kampen.';
  end if;
  if v_room.status <> 'active' then return jsonb_build_object('status', 'completed'); end if;
  if cardinality(v_room.timeline_cards) = 0 then
    raise exception 'Kampen mangler et startkort. Oppdater duelloppsettet før trekket registreres.';
  end if;
  if not p_timeout and v_room.current_turn_id <> v_user_id then
    raise exception 'Det er ikke din tur.';
  end if;
  if p_timeout and v_room.turn_deadline > now() then
    return jsonb_build_object('status', 'active', 'seconds_left',
      greatest(0, ceil(extract(epoch from (v_room.turn_deadline - now())))::integer));
  end if;
  if not p_timeout and v_room.turn_deadline <= now() then
    raise exception 'Tiden er ute. Turen blir avsluttet.';
  end if;
  if not p_timeout and (p_position is null or p_position < 0 or
      p_position > coalesce(array_length(v_room.timeline_cards, 1), 0)) then
    raise exception 'Velg en gyldig plassering på tidslinjen.';
  end if;

  select * into v_event from public.duel_cards where card_id = v_room.current_card_id;
  if v_event.card_id is null then raise exception 'Kortbanken mangler rundens kort.'; end if;
  v_is_one := v_room.current_turn_id = v_room.player_one_id;
  v_lives_one := v_room.player_one_lives;
  v_lives_two := v_room.player_two_lives;
  v_points_one := v_room.player_one_points;
  v_points_two := v_room.player_two_points;
  v_correct_one := v_room.player_one_correct;
  v_wrong_one := v_room.player_one_wrong;
  v_correct_two := v_room.player_two_correct;
  v_wrong_two := v_room.player_two_wrong;
  v_remaining := v_room.remaining_cards;

  if not p_timeout then
    v_correct := true;
    for v_item in
      select card_id, ordinality from unnest(v_room.timeline_cards) with ordinality as placed(card_id, ordinality)
    loop
      if (v_item.ordinality <= p_position and
          public._duel_compare_cards(v_item.card_id, v_event.card_id) > 0) or
         (v_item.ordinality > p_position and
          public._duel_compare_cards(v_event.card_id, v_item.card_id) > 0) then
        v_correct := false;
        exit;
      end if;
    end loop;
  end if;

  if v_correct then
    v_base := v_event.difficulty * 100;
    if p_position > 0 then
      select abs(v_event.year - year) into v_distance from public.duel_cards
        where card_id = v_room.timeline_cards[p_position];
    end if;
    if p_position < coalesce(array_length(v_room.timeline_cards, 1), 0) then
      select least(v_distance, abs(v_event.year - year)) into v_distance from public.duel_cards
        where card_id = v_room.timeline_cards[p_position + 1];
    end if;
    v_rate := case when v_distance <= 10 then 1
      when v_distance <= 50 then 0.5
      when v_distance <= 100 then 0.25 else 0 end;
    v_bonus := round(v_base * v_rate)::integer;
    v_score_delta := v_base + v_bonus;
    select array_agg(item order by sort_order) into v_new_timeline
    from (
      select card_id as item, ordinality * 2 as sort_order
        from unnest(v_room.timeline_cards) with ordinality as placed(card_id, ordinality)
      union all
      select v_event.card_id, p_position * 2 + 1
    ) as ordered_cards;
    if v_is_one then
      v_points_one := v_points_one + v_score_delta;
      v_correct_one := v_correct_one + 1;
    else
      v_points_two := v_points_two + v_score_delta;
      v_correct_two := v_correct_two + 1;
    end if;
  else
    if v_is_one then
      v_lives_one := greatest(0, v_lives_one - 1);
      v_wrong_one := v_wrong_one + 1;
    else
      v_lives_two := greatest(0, v_lives_two - 1);
      v_wrong_two := v_wrong_two + 1;
    end if;
  end if;

  if cardinality(v_remaining) > 0 then
    v_next_card := v_remaining[1];
    v_remaining := coalesce(v_remaining[2:cardinality(v_remaining)], '{}'::text[]);
  else
    v_next_card := null;
  end if;
  v_finished := v_lives_one <= 0 or v_lives_two <= 0 or v_next_card is null;
  if v_lives_one <= 0 then
    v_winner := v_room.player_two_id;
  elsif v_lives_two <= 0 then
    v_winner := v_room.player_one_id;
  elsif v_finished and v_lives_one <> v_lives_two then
    v_winner := case when v_lives_one > v_lives_two then v_room.player_one_id else v_room.player_two_id end;
  elsif v_finished and v_points_one <> v_points_two then
    v_winner := case when v_points_one > v_points_two then v_room.player_one_id else v_room.player_two_id end;
  else
    v_winner := null;
  end if;

  v_next_turn := case when v_is_one then v_room.player_two_id else v_room.player_one_id end;
  v_last_move := jsonb_build_object(
    'player_id', v_user_id,
    'player_name', case when v_is_one then v_room.player_one_name else v_room.player_two_name end,
    'card_id', v_event.card_id,
    'answer_year', v_event.year,
    'correct', v_correct,
    'timed_out', p_timeout,
    'score_delta', v_score_delta,
    'lives_lost', case when v_correct then 0 else 1 end
  );
  update public.duel_rooms set
    timeline_cards = coalesce(v_new_timeline, v_room.timeline_cards),
    remaining_cards = v_remaining,
    current_card_id = case when v_finished then null else v_next_card end,
    current_turn_id = case when v_finished then null else v_next_turn end,
    turn_deadline = case when v_finished then null else now() + interval '60 seconds' end,
    player_one_lives = v_lives_one, player_two_lives = v_lives_two,
    player_one_points = v_points_one, player_two_points = v_points_two,
    player_one_correct = v_correct_one, player_one_wrong = v_wrong_one,
    player_two_correct = v_correct_two, player_two_wrong = v_wrong_two,
    last_move = v_last_move
    where id = p_room_id;

  if v_finished then
    perform public._duel_finish_room(p_room_id, v_winner);
    return jsonb_build_object('status', 'completed', 'correct', v_correct, 'score_delta', v_score_delta);
  end if;
  return jsonb_build_object('status', 'active', 'correct', v_correct,
    'score_delta', v_score_delta, 'next_turn_id', v_next_turn);
end;
$function$;

create or replace function public.duel_move(p_room_id uuid, p_position integer)
returns jsonb
language sql
security definer
set search_path = ''
as $function$
  select public._duel_submit_action(p_room_id, p_position, false);
$function$;

create or replace function public.duel_timeout(p_room_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
as $function$
  select public._duel_submit_action(p_room_id, null, true);
$function$;

create or replace function public.duel_forfeit(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_room public.duel_rooms%rowtype;
  v_winner uuid;
begin
  if v_user_id is null then raise exception 'Du må være logget inn.'; end if;
  select * into v_room from public.duel_rooms where id = p_room_id for update;
  if v_room.id is null or v_user_id not in (v_room.player_one_id, v_room.player_two_id) then
    raise exception 'Du har ikke tilgang til denne kampen.';
  end if;
  if v_room.status <> 'active' then return jsonb_build_object('status', 'completed'); end if;
  v_winner := case when v_user_id = v_room.player_one_id then v_room.player_two_id else v_room.player_one_id end;
  perform public._duel_finish_room(p_room_id, v_winner);
  return jsonb_build_object('status', 'completed', 'forfeited', true);
end;
$function$;

create or replace function public.duel_invites_inbox()
returns setof public.duel_invites
language sql
stable
security definer
set search_path = ''
as $function$
  select * from public.duel_invites
  where invitee_id = (select auth.uid()) and status = 'pending' and expires_at > now()
  order by created_at;
$function$;

revoke all on function public._duel_compare_cards(text, text) from public, anon, authenticated;
revoke all on function public._duel_create_room(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public._duel_finish_room(uuid, uuid) from public, anon, authenticated;
revoke all on function public._duel_submit_action(uuid, integer, boolean) from public, anon, authenticated;
revoke all on function public.duel_my_rating() from public, anon;
revoke all on function public.duel_my_active_room() from public, anon;
revoke all on function public.duel_queue_join() from public, anon;
revoke all on function public.duel_queue_leave() from public, anon;
revoke all on function public.duel_send_invite(text, boolean) from public, anon;
revoke all on function public.duel_invite_respond(uuid, boolean) from public, anon;
revoke all on function public.duel_move(uuid, integer) from public, anon;
revoke all on function public.duel_timeout(uuid) from public, anon;
revoke all on function public.duel_forfeit(uuid) from public, anon;
revoke all on function public.duel_invites_inbox() from public, anon;

grant execute on function public.duel_my_rating() to authenticated;
grant execute on function public.duel_my_active_room() to authenticated;
grant execute on function public.duel_queue_join() to authenticated;
grant execute on function public.duel_queue_leave() to authenticated;
grant execute on function public.duel_send_invite(text, boolean) to authenticated;
grant execute on function public.duel_invite_respond(uuid, boolean) to authenticated;
grant execute on function public.duel_move(uuid, integer) to authenticated;
grant execute on function public.duel_timeout(uuid) to authenticated;
grant execute on function public.duel_forfeit(uuid) to authenticated;
grant execute on function public.duel_invites_inbox() to authenticated;
