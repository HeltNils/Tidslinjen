# Historikerens arbeidsbord — designprøve

Designet er godkjent for hovedsiden. Felles CSS i `archive-theme.css` gir pergament,
mørke atlasflater, messingdetaljer og seriftypografi. Konto og toppliste er synlige
på hovedsiden; bare gjesteprøven skjuler dem via klassen `design-preview`.
Spillet bruker samme kort og spillkode som hovedsiden. Konto og toppliste er
skjult i denne gjesteprøven, og den registrerer ingen service worker.

`tester.html` er et øyeblikksbilde av hovedsidens HTML. Ved senere funksjonsendringer
må strukturen oppdateres før designet eventuelt overføres til hovedsiden.
Bakgrunnsvalget beholder spillets progresjonstekst, men prøveutgaven bruker
atlasbakgrunnen gjennom hele runden. Eksisterende emojier er beholdt foreløpig;
en full illustrasjonsserie er ikke en del av denne designprøven.

Kontroll: `tests/archive-browser.html` kjører spilltestene mot designprøven.
`tests/archive-visual.html` viser en iscenesatt kontroll av Nils og tidslinjen.
Ingen av testfilene brukes av den vanlige testsiden.
