const stages = [
  { ratio: 0.00, key: "underground", name: "Dypt under bakken", desc: "Reisen starter langt under overflaten." },
  { ratio: 0.14, key: "shallow", name: "Nærmere overflaten", desc: "Lys og røtter begynner å dukke opp." },
  { ratio: 0.28, key: "surface", name: "Over bakken", desc: "Tidslinjen har nådd landskapet." },
  { ratio: 0.43, key: "treetops", name: "Over tretoppene", desc: "Vi stiger gradvis høyere." },
  { ratio: 0.57, key: "clouds", name: "I skyene", desc: "Bakgrunnen beveger seg opp gjennom skylaget." },
  { ratio: 0.71, key: "highsky", name: "Høyt over skyene", desc: "Jorda ligger stadig lenger under oss." },
  { ratio: 0.84, key: "atmosphere", name: "I atmosfæren", desc: "Himmelen blir mørkere og verdensrommet nærmer seg." },
  { ratio: 0.96, key: "space", name: "I verdensrommet", desc: "Tidslinjen har nådd helt ut i rommet." }
];

const evolutionStages = [
  { key: "evo-primordial-1", name: "Enkle encellede organismer", desc: "De første svært enkle livsformene oppstår for mer enn 3,5 milliarder år siden.", icon: "🦠" },
  { key: "evo-primordial-2", name: "Mer komplekse encellede organismer", desc: "Celler med cellekjerne utvikler seg.", icon: "🔬" },
  { key: "evo-ocean-1", name: "Flercellede organismer", desc: "Flere celler begynner å samarbeide i én organisme.", icon: "🧬" },
  { key: "evo-ocean-2", name: "Enkle dyr i havet", desc: "Dyrelivet i havet blir stadig mer mangfoldig.", icon: "🪼" },
  { key: "evo-ocean-3", name: "Fisk", desc: "Virveldyr utvikler seg og sprer seg i havene.", icon: "🐟" },
  { key: "evo-shore-1", name: "Tidlige landvirveldyr", desc: "Noen fiskelinjer utvikler lemmer og beveger seg mot livet på land.", icon: "🐟" },
  { key: "evo-shore-2", name: "Amfibier", desc: "Virveldyr lever både i vann og på land.", icon: "🐸" },
  { key: "evo-land-1", name: "Krypdyr-lignende landdyr", desc: "Landvirveldyr blir stadig bedre tilpasset et liv borte fra vannet.", icon: "🦎" },
  { key: "evo-land-2", name: "Tidlige pattedyr", desc: "De første pattedyrene utvikler seg for mer enn 200 millioner år siden.", icon: "🐁" },
  { key: "evo-forest-1", name: "Primater", desc: "Tidlige primater utvikler seg for rundt 60 millioner år siden.", icon: "🐒" },
  { key: "evo-forest-2", name: "Menneskeaper", desc: "Menneskeapenes utviklingslinjer vokser fram.", icon: "🦧" },
  { key: "evo-savanna-1", name: "Tidlige menneskelinjer", desc: "Menneskenes og sjimpansenes utviklingslinjer har skilt lag.", icon: "🐒" },
  { key: "evo-savanna-2", name: "Australopithecus", desc: "Tidlige menneskeslektninger beveger seg regelmessig på to bein.", icon: "🚶" },
  { key: "evo-stone-1", name: "Homo habilis", desc: "Tidlige Homo-arter forbindes med bruk av enkle steinredskaper.", icon: "🪨" },
  { key: "evo-stone-2", name: "Homo erectus", desc: "Større hjerne, spredning utenfor Afrika og kontrollert bruk av ild.", icon: "🔥" },
  { key: "evo-stone-3", name: "Neandertalere og andre menneskearter", desc: "Flere menneskearter lever samtidig i ulike deler av verden.", icon: "🧔" },
  { key: "evo-human-1", name: "Homo sapiens", desc: "Vår egen art oppstår i Afrika for rundt 300 000 år siden.", icon: "🧑" },
  { key: "evo-human-2", name: "Jeger- og sankersamfunn", desc: "Mennesker lever hovedsakelig av jakt, fiske og sanking.", icon: "🏹" },
  { key: "evo-farm-1", name: "Jordbrukssamfunn", desc: "Dyrking og husdyrhold gjør faste bosettinger stadig vanligere.", icon: "🌾" },
  { key: "evo-city-1", name: "Byer og sivilisasjoner", desc: "Byer, stater, skrift, handel og komplekse samfunn vokser fram.", icon: "🏛️" },
  { key: "evo-industrial-1", name: "Industrielt menneske", desc: "Maskiner, fabrikker og nye energikilder forandrer samfunnet.", icon: "🏭" },
  { key: "evo-digital-1", name: "Digitalt menneske", desc: "Datamaskiner, internett, smarttelefoner og kunstig intelligens preger hverdagen.", icon: "💻" },
  { key: "evo-biotech-1", name: "Bioteknologisk menneske", desc: "Proteser, kunstige organer, genredigering og hjerneimplantater utvikles videre.", icon: "🧬" },
  { key: "evo-cyborg-1", name: "Mulig cyborg-menneske", desc: "En mulig framtid der biologiske mennesker blir tettere integrert med teknologi.", icon: "🦾" },
  { key: "evo-future-1", name: "?", desc: "Kunstige sanser, hjerne–datamaskin-grensesnitt eller utvikling vi ennå ikke kan forutse.", icon: "?" }
];

function updateStage() {
  const progressScore =
    Math.max(
      0,
      correct - wrong
    );

  let stage;
  let progress;

  if (
    backgroundTheme ===
    "evolution"
  ) {
    const maxStage =
      evolutionStages.length -
      1;

    const stageIndex =
      Math.min(
        maxStage,
        progressScore
      );

    stage =
      evolutionStages[
        stageIndex
      ];

    progress =
      maxStage > 0
        ? stageIndex /
          maxStage
        : 0;

    document.body.dataset.stage =
      stage.key;

    let evoIcon =
      document.getElementById(
        "evoIcon"
      );

    if (!evoIcon) {
      evoIcon =
        document.createElement(
          "div"
        );

      evoIcon.id =
        "evoIcon";

      evoIcon.className =
        "evo-icon";

      const scene =
        document.querySelector(
          ".scene"
        );

      if (scene) {
        scene.appendChild(
          evoIcon
        );
      }
    }

    if (evoIcon) {
      evoIcon.textContent =
        stage.icon;

      evoIcon.style.display =
        "block";
    }

  } else {
    const ratio =
      Math.min(
        1,
        progressScore / 24
      );

    stage =
      stages[0];

    for (
      const candidate
      of stages
    ) {
      if (
        ratio >=
        candidate.ratio
      ) {
        stage =
          candidate;
      }
    }

    progress =
      ratio;

    document.body.dataset.stage =
      stage.key;

    const evoIcon =
      document.getElementById(
        "evoIcon"
      );

    if (evoIcon) {
      evoIcon.style.display =
        "none";
    }
  }

  $("stageName").textContent =
    stage.name;

  $("stageDesc").textContent =
    stage.desc;

  $("stageProgress").style.width =
    `${progress * 100}%`;
}
