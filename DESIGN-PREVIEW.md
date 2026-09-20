# Historikerens arbeidsbord og bakgrunnsreiser

Hovedsiden og gjesteprøven bruker felles `archive-theme.css`, `journey.css` og
`journey.js`: pergament, messingdetaljer, seriftypografi og illustrerte miljøer.
De to bakgrunnsreisene skifter miljø med progresjonen, med overtoning og svak
kamerabevegelse. Systeminnstillingen for redusert bevegelse respekteres.

«Historikerens arbeidsbord – rolig bilde» er et tredje bakgrunnsvalg med ett
fast, rustikt bilde gjennom hele runden. Bakgrunnsvalget lagres automatisk.
Bilder og genereringsprompter er dokumentert i `assets/journey/README.md`.

`tester.html` er et øyeblikksbilde av hovedsidens HTML og må holdes oppdatert
ved strukturendringer. Bare gjesteprøven skjuler konto og toppliste via
`design-preview`, har piler for å forhåndsvise miljøene og utelater service worker.
Forhåndsvisningen påvirker ikke poeng eller kort.

Kontroller:
- `tests/browser.html`: 69 spillkontroller mot hovedsiden.
- `tests/archive-browser.html`: spillkontroller mot gjesteprøven.
- `tests/archive-visual.html`: iscenesatt visning av Nils og tidslinjen.
- `tests/journey-browser.html`: ti kontroller for bilder, overganger, raske
  sceneskift og den statiske bakgrunnen. Bruk ekte nettlesertid slik at
  bildedekoding får fullføre.