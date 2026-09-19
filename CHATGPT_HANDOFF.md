# ChatGPT handoff – Tidslinjen

Dette dokumentet er en kort prosjekt-overlevering fra hovedsamtalen i ChatGPT til Codex/VS Code.

## Prosjekt
Repository: `HeltNils/Tidslinjen`

Hovedfiler:
- `events.js` – hendelsesbanken
- `game.js` – spillmotor og filtrering
- `index.html` – brukergrensesnitt
- `styles.css` – design, bakgrunner og responsive regler

Arbeid skal som hovedregel gjøres på `test`-branchen først. Ikke merge til `main` uten eksplisitt beskjed fra brukeren.

## Nåværende funksjonalitet
- 105 historiske hendelseskort.
- Vanskelighetsgrad:
  - 1 = lett
  - 2 = middels
  - 3 = vanskelig
- Brukeren kan kombinere nivå 1, 2 og 3 fritt.
- Minst ett nivå må være valgt.
- Nivåvalgene låses mens en runde pågår.
- Vanskelighetsgrad vises på kortet først etter at svaret er avslørt.
- Første kort i tidslinjemodus plasseres automatisk og teller ikke som riktig svar.
- `Igjen` teller bare kort som faktisk er med i den filtrerte kortstokken.

## Spillemoduser
1. Tidslinje – plasser hendelsen i forhold til andre kort.
2. Eksakt årstall.
3. Innenfor ±10 år.
4. Riktig århundre.
5. Riktig årtusen.

## Årsspenn og omtrentlige dateringer
`events.js` bruker:
- `acceptedYears` for flere konkrete godkjente år.
- `yearRange` for hendelser med intervall.
- `acceptedYearRange` for spillmessige godkjente intervaller.
- `skipYearGuess` for hendelser som ikke egner seg til eksakt år/±10.

`game.js` skal behandle disse riktig i årstallmodusene.

## Progresjon / bakgrunn
To bakgrunnssystemer finnes:

### 1. Høyde
Under bakken → overflaten → tretoppene → skyene → atmosfæren → verdensrommet.

Netto progresjon:
`max(0, correct - wrong)`

Det kreves 24 netto riktige for å nå verdensrommet.

### 2. Livets utvikling
25 stadier fra enkle encellede organismer til mulig framtid/cyborg.
Én netto riktig flytter ett stadium fram. Feil kan flytte eleven tilbake.

## Viktig neste funksjon: trinn/pensum
Brukeren ønsker senere et separat pensumfilter for:
- 8. trinn
- 9. trinn
- 10. trinn

Dette er IKKE en ny vanskelighetsgrad.

Planlagt datamodell per kort:
```js
difficulty: 2,
grades: [8, 9, 10]
```

Regler:
- Ett kort kan tilhøre ett, flere eller alle tre trinn.
- Et kort kan også tilhøre ingen trinn: `grades: []`.
- Eksempel: «Svartedauden rammer Norge» kan passe på 8., 9. og 10. trinn.
- Trinnfilteret skal senere kunne kombineres med eksisterende vanskelighetsfilter.
- Ikke legg inn `grades` ennå før brukeren har vurdert kortene mot pensum.

## Plan for vurderingsdokument
Brukeren vil først gå gjennom pensum/lærebøker for 8., 9. og 10. trinn.
Deretter skal det lages et vurderingsdokument med alle 105 hendelser der brukeren kan angi:
- vanskelighetsgrad
- 8. trinn: ja/nei
- 9. trinn: ja/nei
- 10. trinn: ja/nei
- eventuelt kommentar

Et kort kan ha flere trinn eller ingen.

## Arbeidsmåte
- Behold eksisterende funksjonalitet når nye ting implementeres.
- Les relevante filer før endringer.
- Gjør små, kontrollerte endringer.
- Test før commit.
- Vis hvilke filer som er endret.
- Ikke commit, push eller merge med mindre brukeren ber om det eksplisitt.
- Ved større endringer: foreslå en kort handlingsplan først.

## Viktig om prosjektets rollefordeling
ChatGPT-hovedsamtalen brukes til:
- overordnet prosjektoversikt
- pedagogiske valg
- hendelsesbank
- planlegging
- kvalitetssikring

Codex/VS Code brukes til:
- å lese de faktiske prosjektfilene
- gjøre kodeendringer lokalt
- teste
- vise diff
- eventuelt commit/push etter eksplisitt beskjed

Når denne filen leses i Codex/VS Code, les også de fire hovedfilene direkte før du foreslår eller gjør endringer.
