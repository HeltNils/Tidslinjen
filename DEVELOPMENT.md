# Utvikling og kontroll

Endringer prøves på `test` før brukeren godkjenner overføring til `main`.

## Filer

- `events.js`: hendelsesbanken.
- `learning.js`: validering, resultatberegning og lagring av innstillinger.
- `background.js`: bakgrunnsstadier og progresjon.
- `game.js`: rundetilstand, svarbehandling og grensesnitt.
- `server.mjs`: lokal webserver, brukerkontoer og SQLite-database.
- `account.js` og `account.css`: registrering, innlogging og utlogging.
- `styles.css` og `height-backgrounds.css`: utseende.

Skript lastes med `defer` i rekkefølgen events, learning, background, game.
Bakgrunnsfunksjonen bruker spilltilstanden først når spillet initialiseres.

## Runderegler

Rundelengde på 10 eller 20 betyr totalt antall kort, begrenset av valgt kortstokk.
I tidslinjen er ett av kortene et automatisk startkort; 10 kort gir 9 spørsmål.
Hurtigstart velger tidslinje, alle vanskelighetsnivåer og 10 tilfeldige kort.
Etter siste svar viser «Se resultat» sluttskjermen.

Øving på feil bruker feilkortene fra forrige runde, uavhengig av rundelengde.
I tidslinjen beholdes det opprinnelige startkortet som støtte, og alle feilkort
må besvares. Automatisk løsning bruker bare kortene i den aktuelle runden og
gir ikke ekstra poeng. Resultatprosenten gjelder bare elevens egne svar.

Innstillinger lagres lokalt under `tidslinjen.settings.v1`.
Spillet fungerer også dersom nettleseren blokkerer lagring.

## Tester

Åpne `tests/browser.html` fra samme lokale webserver som spillet. Testen viser
PASS/FAIL for filtrering, rundelengde, alle svarmoduser, øving på feil,
automatisk løsning, resultat, kilder, zoom, validering og innstillinger.
Ved kjøring direkte fra fil trenger Chromium `--allow-file-access-from-files`.
Bruk en egen nettleserprofil: testen endrer lagrede innstillinger i testprofilen.

Hendelsesbanken kontrolleres også ved oppstart. Eventuelle dataproblemer
vises som varsler i nettleserkonsollen, med kortets bankId.

Pensumfilter og trinntilordning venter etter brukerens ønske. Lærermodus med
region-, periode- og kategorifiltre er en senere utvidelse.

Kontosystemets oppstart og publisering er beskrevet i `ACCOUNTS.md`.
