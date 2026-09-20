# Illustrerte bakgrunnsreiser og rolig arbeidsbord

Generert med det innebygde imagegen-verktøyet. Originale PNG-er er bevart her:
`earth.png`, `land.png`, `ocean.png`, `space.png`, `civilization.png`, `rustic.png`.
Bildene er stemningsillustrasjoner, ikke vitenskapelige rekonstruksjoner.
Fem hovedmiljøer deles av flere progresjonsstadier med ulikt bildeutsnitt.

Brukes av hovedsiden og `tester.html` gjennom `journey.js` og
`journey.css`. Alle seks bildene inngår i service workerens offline-cache.

## Prompter

For earth, land, space og civilization ble følgende mal brukt, med sceneteksten
under satt inn i stedet for SCENE:

Generate a wide landscape background illustration for a history learning game. SCENE Cohesive sophisticated museum exhibition / painted historical atlas art direction, realistic geology and materials, richly textured painterly detail, subdued antique gold, earthy olive, slate and charcoal palette with natural lighting. Beautiful cinematic environment, not a flat gradient or infographic. Wide 3:2 landscape composition, no labels, no text, no border, no collage. Detail most prominent on left and right, quieter central area for interface readability.

- earth: Deep beneath the earth, monumental ancient cave interior, layered rock strata, delicate roots descending from a narrow opening high overhead, amber light shafts, weathered fossils subtly visible in stone, atmospheric dust, imposing cinematic scale. No people.
- land: Primeval green earth landscape, winding river leading from foreground wetlands through ancient fern forests toward distant rugged mountains, soft golden dawn and low rolling mist, rich natural detail, dramatic layered depth, no buildings or people.
- space: View from high above Earth toward outer space, curved blue Earth horizon along bottom third, luminous thin atmosphere, immense deep navy star field, subtle warm distant nebula and starlight, scientifically plausible aesthetic, elegant awe-inspiring celestial landscape, no spacecraft, no text.
- civilization: Ancient human civilization river valley at dusk, historically inspired stone settlement with terraces and a few warm lamps in foreground, fields along river and distant monumental city silhouettes, vast dramatic sky fading from warm copper sunset to navy stars, painterly natural history museum atmosphere. No recognizable real monument, no people close up.

Ocean brukte denne selvstendige prompten:

Wide 3:2 landscape illustration for a natural history museum learning game. An ancient prehistoric shallow ocean seen entirely underwater, sunbeams slanting through teal water, layered rocky seabed with early marine organisms, small primitive fish silhouettes and delicate sea fronds, deep atmospheric perspective, subtle gold sunlight at the top. Cinematic, realistic painterly environmental illustration with richly textured rock and water, sophisticated muted teal, slate and antique gold palette. No humans, no modern objects, no text, no border, no collage. Quiet central area, interesting silhouettes at edges.

## Overganger og kontroll

- Nye bilder dekodes før visning; neste miljø forhåndslastes.
- Overtoning på 1,5 sekund med svak kamerabevegelse; eldre lag ryddes bort.
- Redusert bevegelse i systeminnstillingene gir umiddelbart sceneskifte.
- Testpilene endrer bare bakgrunnsvisningen, ikke poeng eller spillerens kort.
- `tests/journey-browser.html`: ti kontroller for innlasting, temabytte og
  raske skift. Kjøres med ekte nettlesertid; virtuell headless-tid kan løpe fra
  bildedekodingen og rapportere falske tidsavbrudd.
- `tests/archive-browser.html`: 69 spillkontroller består også med nye bakgrunner.

## Historikerens arbeidsbord

`rustic.png` er et separat, statisk bakgrunnsvalg. Bildet endres ikke med
spillprogresjonen og har ingen kamerabevegelse. Laget som et nytt bilde med
innebygd imagegen, med denne prompten:

Create a wide 3:2 landscape background image for a history classroom game with a calm rustic historical archive aesthetic. A quietly lit old historian's desk viewed from above at a gentle angle: beautifully aged dark olive-brown wood and muted parchment, a faint hand drawn antique map and fine compass construction lines, the corner of a worn leather journal and a small tarnished brass compass confined to the far outer edges. Most of the center is spacious subdued textured parchment and shadowed wood without objects. Soft diffuse window light, low contrast, muted warm umber, slate olive and desaturated antique brass. Tactile realistic materials, sophisticated understated museum atmosphere, restful on the eyes. No readable writing, no labels, no text, no dramatic glow, no people, no bright highlights. Single coherent scene, not a collage.