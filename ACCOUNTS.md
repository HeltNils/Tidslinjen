# Kontoer uten e-post

Registrering, innlogging og utlogging bruker bare brukernavn og passord.
Det er fortsatt mulig å spille som gjest. Kontoen lagrer foreløpig ikke poeng,
spillhistorikk eller innstillinger på tvers av enheter.

## Lokal oppstart

Installer Node.js 24 LTS eller nyere. Det er ingen npm-avhengigheter.
På denne testmaskinen kan `Start-Test.ps1` også bruke den portable Node-versjonen
som ble lastet ned til den midlertidige mappen under utviklingen.

```powershell
npm start
```

Åpne `http://127.0.0.1:3000`. HTML-filen alene kan fortsatt brukes til spillet,
men kontofunksjonene krever denne serveren. Serveren oppretter
`data/accounts.sqlite`, som ikke skal legges i Git eller på en offentlig filserver.
Ta vare på databasen: uten den finnes ikke kontoene lenger.

## Tester

```powershell
npm test
```

API-testene bruker en egen midlertidig database. `tests/browser.html` tester
spillet. `tests/account-browser.html` tester kontoene i nettleseren og skal
bare kjøres mot en egen testdatabase, ettersom den oppretter en testkonto.

## Nettpublisering

GitHub Pages kan ikke kjøre kontoserveren. Velg en Node.js-server med vedvarende
disk og HTTPS. Serveren leverer både spillet og API-et fra samme origin.
En offentlig publisering er ikke satt opp ennå.

## Supabase Auth og felles scoreboard

Frontend kan bruke `supabase-config.js` med prosjektets URL og publishable key.
Kjør `supabase-schema.sql` i Supabase SQL Editor først. Under Authentication
må `Confirm email` være slått av, fordi spillet bruker brukernavn uten e-post.
Supabase publishable key skal aldri erstattes med en secret/service_role-nøkkel.

Miljøvariabler ved produksjon:

- `NODE_ENV=production`
- `PUBLIC_ORIGIN=https://ditt-domene.no` (ingen avsluttende skråstrek)
- `HOST=0.0.0.0` ved drift bak en HTTPS-proxy
- `PORT=3000` eller porten vertstjenesten gir
- `DATABASE_PATH=/var/lib/tidslinjen/accounts.sqlite` på vedvarende disk

Kjør én serverinstans med sin SQLite-database. HTTPS-proxyen skal videresende
trafikken til Node; Node-porten skal ikke eksponeres direkte på Internett.
Proxyens IP brukes til hastighetsbegrensning – `X-Forwarded-For` stoles ikke
automatisk på. Grensen er 120 innloggings-/registreringsforsøk per IP per
15 minutter og 40 registreringer per time; tilpass før stor klasseromsbruk.
Testfilene er utilgjengelige når `NODE_ENV=production`.

## Passord og sesjoner

- Brukernavn: 3–24 bokstaver, med stor forbokstav, uten mellomrom, tall eller
  symboler. Store og små bokstaver regnes som samme brukernavn. Kjente støtende
  begreper og enkelte upassende navn blokkeres for å holde topplisten nøytral;
  blokkeringslisten ligger i `server.mjs`.
- Passord: 15–128 tegn; mellomrom er tillatt, uten krav om spesialtegn.
- Passord lagres med scrypt (N=131072, r=8, p=1) og tilfeldig 16-byte salt.
- Sesjoner varer i 8 timer og lagres som hasher i databasen. Nettleseren får
  en HttpOnly/SameSite=Strict-cookie, med Secure og `__Host-`-prefiks på HTTPS.
- Endrende API-kall krever korrekt Origin. SQL bruker bundne parametere.
- Innlogging begrenses også per brukernavn. Kontoene inneholder ingen e-post.
- Passordgjenoppretting og læreradministrasjon er ikke implementert.

Faggrunnlag: [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html),
[OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html),
[Node.js SQLite](https://nodejs.org/api/sqlite.html).
