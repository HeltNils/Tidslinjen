# Bokminne og videre import

`catalog.json` gir hver bok en stabil ID. Kort i `events.js` har `bookSources`,
en liste med `{ bookId, pages, pdfPages, note }`. `pages` er trykte sidetall,
`pdfPages` er 1-baserte sider i vedlegget. Eksisterende nettkilder beholdes.

Ved senere bøker: søk etter samme hendelse i hele banken, også andre navn og
årstall. Samme hendelse skal beholde sin `bankId`; legg bare til en bokreferanse.
Likhet i årstall alene er ikke nok. Usikre treff og dateringskonflikter må vurderes.
To ulike hendelser samme år skal ikke slås sammen.

Et fremtidig bokfilter kan bruke `event.bookSources.some(s => s.bookId === id)`.
Ved valg av flere bøker brukes unionen av kortene, én gang per `bankId`.
Hvis en bok slås av, beholdes et delt kort så lenge en annen valgt bok inkluderer
det. Dette er foreslått filterlogikk; knappen er ikke bygget ennå.

## Timelines of World History (2002)

Ny gjennomgang: Åtte ytterligere kort med selvstendige korttekster,
dateringskontroll og bokreferanser ligger i [neste kortutvalg](teeple-next-cards.md).
Disse er importert som TWH3–TWH10. G2 og N2 har også fått bokreferanser,
slik at 13 kort nå er knyttet til boka. Se denne filen for oppdatert
lesestatus og registrerte overlapp med eksisterende kort.

- Første gjennomgang: 20. september 2026.
- Tittel/utgave bekreftet på PDF-side 5–6.
- Innholdsfortegnelse og leserveiledning gjennomgått på PDF-side 8–11.
- Forhistorien på PDF-side 12–16 er lest, men ikke ferdig fagkontrollert.
- Første kortutvalg: trykt side 14–15, PDF-side 18–19.
- Neste arbeid: fullfør vurdering av resterende hendelser på side 14–15,
  deretter kartet på side 16–17 og kapitlet om jordbruk på side 18–19.
- Ingen påstand om at hele boka eller hele dette kapittelet er ferdig importert.
- Ikke bruk fast PDF-offset for hele boka uten å kontrollere trykte sidetall.
  Innholdsfortegnelsens sluttall og PDF-lengden stemmer ikke direkte overens.

### Registrerte kort

| Kort | Handling | Trykt/PDF-side | Merknad |
| --- | --- | --- | --- |
| G1 | Knyttet eksisterende jordbrukskort til boka | 14 / 18 | Tematisk støtte. Boka oppgir ca. 9000 f.Kr. for dyrking i Nord-Syria; eksisterende kort er en bred prosess datert ca. 10000 f.Kr. |
| TWH1 | Çatalhöyük, nytt kort | 14 / 18 | Boka sier ca. 7000 f.Kr.; kortet bruker ca. 7400 f.Kr. etter UNESCO. |
| TWH2 | Båndkeramisk kultur, nytt kort | 15 / 19 | Ca. 5500 f.Kr.; kontrollert mot forskningsartikkel. |

### Kontrollkilder og åpne spørsmål

- TWH1: https://whc.unesco.org/en/list/1405/ (bosetting 7400–6200 f.Kr.).
- TWH2: https://www.nature.com/articles/srep29458 (oppkomst omkring 5500 f.Kr.).
- Begge er omtrentlige dateringer, ikke hendelser med kjent eksakt år.
- Påstandene om de første moderne menneskene og den eldste keramikken må
  kontrolleres mot nyere forskning før kort lages. Ikke kopier bokas «første»
  eller «eldste» ukritisk.
- Kobbersmelting i Çatalhöyük er ikke importert; krever særskilt fagkontroll.
- PDF-teksten har OCR-feil og kolonner som flyter sammen. Kontroller plassering
  og årstall ved tvil. Tekstuttrekk er ikke en ferdig kvalitetssikret kortbank.

PDF og fulltekst skal ikke legges i Git eller publiseres. Korttekstene er korte,
selvstendige formuleringer av fakta. Importen inngår i main fra 20. september 2026.

## Tredje gjennomgang

Seks nye kort, TWH11–TWH16, er lagt inn lokalt. Banken har nå 135 vanlige
kort og bonuskortet Nils. Totalt 19 kort har referanse til Teeple-boka.
Se [tredje kortutvalg](teeple-third-cards.md) for kilder og dateringsavvik.
Lesingen har kommet til PDF-side 38; neste side er 39. Tidligere åpne
fagspørsmål gjenstår. Denne kortgruppen publiseres på main med denne endringen.
