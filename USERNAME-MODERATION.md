# Brukernavnfilter

Nettsiden og den lokale serveren bruker `username-policy.js`. Sperren gjelder
også blokkerte ord som inngår i et lengre navn, uavhengig av store/små bokstaver
og vanlige aksenter. Nye ord må legges til både her og i SQL-filen.
Et ordlistefilter fanger ikke opp alle tenkelige omskrivninger.

## Aktivering i Supabase

1. Åpne prosjektets SQL Editor: https://supabase.com/dashboard/project/bmnxwxrusvcforewkbpq/sql/new
2. Lim inn hele `supabase-username-policy.sql` og kjør den. Tabellen fra
   `supabase-schema.sql` må allerede finnes. Migreringen kan kjøres flere ganger.
3. Kontroller at følgende gir `false`, `false`, `true`:

   ```sql
   select public.username_allowed('Hitler'),
          public.username_allowed('Hítler'),
          public.username_allowed('Nils');
   ```

Migreringen kontrollerer nye kontoer og endringer i brukermetadata i databasen.
Den kontrollerer også navnet ved lagring av resultater og henter visningsnavnet
fra kontoen. Eksisterende resultater med blokkerte navn skjules av lesepolicyen.
Ingen kontoer eller resultater slettes.

Frontend alene kan omgås. Databasemigreringen må aktiveres i tillegg til å
publisere nettsidefilene. Migreringen er ikke kjørt mot produksjonsdatabasen
fra dette arbeidsmiljøet, som ikke har Supabase-administratortilgang.

Supabases veiledning for databaserutiner ved konto-opprettelse:
https://supabase.com/docs/guides/auth/managing-user-data#using-triggers
