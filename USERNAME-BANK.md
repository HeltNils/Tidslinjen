# Navnebank for brukernavn

Rediger `username-bank.json` for å legge til eller fjerne ord som ikke skal
kunne brukes i et brukernavn. Hvert ord skrives med små bokstaver, én gang.
Banken gjelder brukernavn, ikke historiske kort eller fagtekster.

Kjør etter endringer:

```sh
node scripts/sync-username-bank.mjs
node scripts/sync-username-bank.mjs --check
node --test --test-isolation=none tests/username-policy.test.mjs
```

Skriptet oppdaterer listene i `username-policy.js` og
`supabase-username-policy.sql`. Nettleseren og den lokale kontotjeneren bruker
samme JavaScript-regel. SQL-filen må i tillegg kjøres i Supabase SQL Editor
for å håndheve den oppdaterte banken på databasesiden. Publisering til GitHub
Pages aktiverer ikke SQL-regelen automatisk.

Ordene blokkeres også som del av lengre navn. Store/små bokstaver og mange
aksentvarianter behandles likt. Registreringen tillater bare 3–12 bokstaver
med nøyaktig én stor bokstav først og bare små bokstaver etterpå; tall,
mellomrom og symboler avvises av formatregelen. Æ, ø, å og andre bokstaver
med store/små former støttes. Innlogging beholder støtte for eksisterende
navn med blanding av store og små bokstaver.

Alle 214 navn fra brukerens tilleggsønske er tatt med (ett fantes allerede).
Banken har nå 252 unike oppføringer. `animallover69` er registrert i banken,
selv om formatregelen også avviser dette navnet på grunn av tallene.
Dette er en ordliste, ikke en garanti mot alle nye skrivemåter eller omskrivninger.

Den eksisterende listen er bevart, inkludert tidligere sperrede personnavn.
Vær oppmerksom på at korte deler som «kirk» og «george» også kan sperre ellers
vanlige navn. Vurder hver ny oppføring før den legges til. Identitetsord som
«gay», «homo» og «trans» er ikke i seg selv sperreord.

Eksisterende kontoer slettes ikke. SQL-filen inneholder også kontroll av
profilendringer og resultatinnsending, samt filtrering av uegnede navn på
topplisten. Om disse reglene er aktivert i produksjonsdatabasen må bekreftes
med administratortilgang.

Registrering avviser tre eller flere like bokstaver på rad, også når den
første er stor (Aaa). To er tillatt (Haakon). Denne regelen sammenligner
bokstaver uten å skille store og små, men beholder forskjellen mellom
aksentbokstaver. Eksisterende kontoer kan fortsatt logge inn.
