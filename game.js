const events = window.TIMELINE_EVENTS || [];

if (!events.length) {
  console.error("Hendelsesbanken kunne ikke lastes.");
}

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

const modeInfo = {
  timeline: {
    title: "Bygg tidslinjen",
    text: "Du trenger ikke vite årstallet. Plasser hendelsen før, mellom eller etter kortene som allerede ligger ute.",
    help: "Du trenger ikke vite årstallet – bare hva som kom før og etter."
  },

  exact: {
    title: "Treff årstallet",
    text: "Skriv inn et årstall som passer hendelsen.",
    help: "Ved omtrentlige dateringer og årsspenn godkjennes hele det definerte intervallet."
  },

  ten: {
    title: "Hvor nær kommer du?",
    text: "Skriv inn et årstall. Du får riktig hvis du er maksimalt 10 år fra et godkjent år eller intervall.",
    help: "Ved årsspenn regnes avstanden fra nærmeste del av intervallet."
  },

  century: {
    title: "Velg riktig århundre",
    text: "Du trenger ikke vite det nøyaktige årstallet. Velg århundret hendelsen tilhører.",
    help: "Eksempel: 1789 = 18. århundre."
  },

  millennium: {
    title: "Velg riktig årtusen",
    text: "Velg hvilket årtusen hendelsen tilhører.",
    help: "Passer godt for svært gamle hendelser."
  }
};

let deck = [];
let placed = [];
let current = null;
let selectedSlot = null;
let correct = 0;
let wrong = 0;
let resolved = true;
let mode = "timeline";
let backgroundTheme = "height";
let roundActive = false;

const $ = id => document.getElementById(id);

const timeline = $("timeline");
const currentImage = $("currentImage");
const currentTitle = $("currentTitle");
const currentYear = $("currentYear");
const currentSub = $("currentSub");
const checkBtn = $("checkBtn");
const nextBtn = $("nextBtn");
const startBtn = $("startBtn");
const feedback = $("feedback");
const choiceGrid = $("choiceGrid");
const yearForm = $("yearForm");
const yearInput = $("yearInput");
const infoBtn = $("infoBtn");
const infoOverlay = $("infoOverlay");
const infoTitle = $("infoTitle");
const infoText = $("infoText");
const difficultyError = $("difficultyError");

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function era(year) {
  return year < 0
    ? "f.Kr."
    : "e.Kr.";
}

function centuryNumber(year) {
  return Math.floor(
    (Math.abs(year) - 1) / 100
  ) + 1;
}

function millenniumNumber(year) {
  return Math.floor(
    (Math.abs(year) - 1) / 1000
  ) + 1;
}

function centuryLabel(year) {
  return `${centuryNumber(year)}. århundre ${era(year)}`;
}

function millenniumLabel(year) {
  return `${millenniumNumber(year)}. årtusen ${era(year)}`;
}

function getSelectedDifficulties() {
  return [1, 2, 3].filter(level => {
    const box = $(`difficulty${level}`);

    return box && box.checked;
  });
}

function clearDifficultyError() {
  if (difficultyError) {
    difficultyError.textContent = "";
  }
}

function setDifficultyLocked(locked) {
  [1, 2, 3].forEach(level => {
    const box = $(`difficulty${level}`);

    if (box) {
      box.disabled = locked;
    }
  });
}

function getDifficultyLabel(level) {
  if (Number(level) === 1) {
    return "Nivå 1 – lett";
  }

  if (Number(level) === 2) {
    return "Nivå 2 – middels";
  }

  if (Number(level) === 3) {
    return "Nivå 3 – vanskelig";
  }

  return "";
}

function hideDifficultyBadge() {
  const badge = $("currentDifficulty");

  if (!badge) {
    return;
  }

  badge.textContent = "";
  badge.className = "difficulty-badge hidden";
}

function showDifficultyBadge(event) {
  const badge = $("currentDifficulty");

  if (!badge || !event) {
    return;
  }

  const level = Number(event.difficulty);

  badge.textContent =
    getDifficultyLabel(level);

  badge.className =
    `difficulty-badge level-${level}`;
}

function setModeUI() {
  const info = modeInfo[mode];

  $("challengeTitle").textContent =
    info.title;

  $("challengeText").textContent =
    info.text;

  $("modeHelp").textContent =
    info.help;

  $("timelineArea").style.display =
    mode === "timeline"
      ? "block"
      : "none";

  $("timelineInstruction")
    .classList.toggle(
      "hidden",
      mode !== "timeline"
    );

  yearForm.classList.toggle(
    "hidden",
    !(
      mode === "exact" ||
      mode === "ten"
    )
  );

  choiceGrid.classList.toggle(
    "hidden",
    !(
      mode === "century" ||
      mode === "millennium"
    )
  );

  checkBtn.style.display =
    mode === "timeline"
      ? "inline-block"
      : "none";
}

function getPlayableEvents() {
  const selectedLevels =
    getSelectedDifficulties();

  let filtered =
    events.filter(event =>
      selectedLevels.includes(
        Number(event.difficulty)
      )
    );

  /*
    Hendelser som bare kan beskrives
    som f.eks. "før 7000 f.Kr."
    brukes ikke i årstallmodusene.
  */

  if (
    mode === "exact" ||
    mode === "ten"
  ) {
    filtered =
      filtered.filter(
        event =>
          !event.skipYearGuess
      );
  }

  return filtered;
}

function prepareSetup(
  message =
    "Velg spillemodus og vanskelighetsgrad, og start en ny runde."
) {
  roundActive = false;

  deck = [];
  placed = [];
  current = null;
  selectedSlot = null;

  correct = 0;
  wrong = 0;

  resolved = true;

  setDifficultyLocked(false);
  clearDifficultyError();

  startBtn.textContent =
    "▶ Start spill";

  nextBtn.disabled = true;
  checkBtn.disabled = true;
  infoBtn.disabled = true;

  timeline.innerHTML = "";
  choiceGrid.innerHTML = "";

  yearInput.value = "";

  hideDifficultyBadge();

  currentTitle.textContent =
    "Klar for ny runde";

  currentImage.textContent =
    "🃏";

  currentYear.classList.add(
    "hidden"
  );

  currentSub.textContent =
    "Velg nivå og trykk Start spill";

  feedback.className =
    "feedback";

  feedback.textContent =
    message;

  updateStats();
  updateStage();
  setModeUI();
}

function startGame() {
  if (!events.length) {
    showFeedback(
      false,
      "Hendelsesbanken kunne ikke lastes. Sjekk events.js."
    );

    return;
  }

  const selectedLevels =
    getSelectedDifficulties();

  if (!selectedLevels.length) {
    const message =
      "Velg minst ett vanskelighetsnivå før du starter spillet.";

    if (difficultyError) {
      difficultyError.textContent =
        message;
    }

    showFeedback(
      false,
      message
    );

    return;
  }

  const playableEvents =
    getPlayableEvents();

  if (!playableEvents.length) {
    showFeedback(
      false,
      "Ingen kort kan brukes med denne kombinasjonen av spillemodus og vanskelighetsgrad."
    );

    return;
  }

  clearDifficultyError();

  /*
    Lås nivåvalgene når runden starter.
  */

  setDifficultyLocked(true);

  roundActive = true;

  startBtn.textContent =
    "↻ Ny runde / endre nivå";

  deck =
    shuffle(
      playableEvents
    );

  placed = [];
  current = null;
  selectedSlot = null;

  correct = 0;
  wrong = 0;

  resolved = true;

  feedback.className =
    "feedback";

  feedback.textContent =
    "";

  nextBtn.disabled = true;
  checkBtn.disabled = true;
  infoBtn.disabled = true;

  updateStats();
  updateStage();
  setModeUI();

  if (mode === "timeline") {
    current =
      deck.pop();

    placed.push(
      current
    );

    placed.sort(
      (a, b) =>
        a.year - b.year
    );

    /*
      Startkortet teller ikke
      som et riktig svar.
    */

    correct = 0;
    resolved = true;

    revealCurrent(
      current,
      true
    );

    renderTimeline();

    updateStats();
    updateStage();

    feedback.className =
      "feedback show ok";

    feedback.textContent =
      `Startkort: ${current.title} – ${current.displayYear}. Første kort plasseres automatisk.`;

    nextBtn.disabled =
      false;

  } else {
    drawNext();
  }
}

function finishRound() {
  roundActive = false;

  setDifficultyLocked(false);

  startBtn.textContent =
    "↻ Spill igjen";

  current = null;

  renderEmptyCurrent();

  feedback.className =
    "feedback show ok";

  feedback.textContent =
    "Runden er ferdig! Du kan nå endre nivåene eller spille igjen.";

  nextBtn.disabled =
    true;

  checkBtn.disabled =
    true;
}

function drawNext() {
  if (!deck.length) {
    finishRound();

    return;
  }

  current =
    deck.pop();

  selectedSlot =
    null;

  resolved =
    false;

  showCurrent(
    current
  );

  feedback.className =
    "feedback";

  feedback.textContent =
    "";

  nextBtn.disabled =
    true;

  checkBtn.disabled =
    true;

  yearInput.value =
    "";

  if (
    mode === "timeline"
  ) {
    renderTimeline();
  }

  if (
    mode === "century" ||
    mode === "millennium"
  ) {
    makeChoices();
  }

  updateStats();
}

function showCurrent(event) {
  currentTitle.textContent =
    event.title;

  currentYear.textContent =
    event.displayYear;

  currentYear.classList.add(
    "hidden"
  );

  currentSub.textContent =
    "Årstallet er skjult";

  infoBtn.disabled =
    false;

  hideDifficultyBadge();

  if (event.image) {
    currentImage.innerHTML =
      `<img src="${event.image}" alt="">`;
  } else {
    currentImage.textContent =
      event.emoji ||
      "🕰️";
  }
}

function revealCurrent(
  event,
  keepShown = false
) {
  showCurrent(
    event
  );

  currentYear.classList.remove(
    "hidden"
  );

  currentSub.textContent =
    keepShown
      ? "Startkort"
      : "Årstallet er avslørt";

  /*
    Vis nivå først etter at svaret
    er avslørt.
  */

  showDifficultyBadge(
    event
  );
}

function renderEmptyCurrent() {
  currentTitle.textContent =
    "Runden er ferdig";

  currentImage.textContent =
    "🏁";

  currentYear.classList.add(
    "hidden"
  );

  currentSub.textContent =
    "Start på nytt for en ny runde";

  infoBtn.disabled =
    true;

  hideDifficultyBadge();
}

function renderTimeline() {
  timeline.innerHTML =
    "";

  timeline.appendChild(
    makeSlot(0)
  );

  placed.forEach(
    (event, index) => {
      timeline.appendChild(
        makePlaced(event)
      );

      timeline.appendChild(
        makeSlot(
          index + 1
        )
      );
    }
  );

  if (
    resolved ||
    !current
  ) {
    timeline
      .querySelectorAll(
        ".slot"
      )
      .forEach(
        slot =>
          slot.classList.add(
            "disabled"
          )
      );
  }
}

function makePlaced(event) {
  const element =
    document.createElement(
      "div"
    );

  element.className =
    "placed-card";

  const media =
    event.image
      ? `<img src="${event.image}" alt="">`
      : (
          event.emoji ||
          "🕰️"
        );

  element.innerHTML = `
    <div class="mini-img">
      ${media}
    </div>

    <div class="mini-year">
      ${event.displayYear}
    </div>

    <div class="mini-title">
      ${event.title}
    </div>
  `;

  return element;
}

function makeSlot(index) {
  const element =
    document.createElement(
      "div"
    );

  element.className =
    "slot";

  element.dataset.index =
    index;

  element.innerHTML =
    `<div><span class="plus">＋</span>Plasser her</div>`;

  if (
    !resolved &&
    current
  ) {
    element.addEventListener(
      "click",
      () => {
        selectedSlot =
          index;

        timeline
          .querySelectorAll(
            ".slot"
          )
          .forEach(
            slot =>
              slot.classList.remove(
                "selected"
              )
          );

        element.classList.add(
          "selected"
        );

        checkBtn.disabled =
          false;
      }
    );
  }

  return element;
}

function checkTimeline() {
  if (
    !current ||
    selectedSlot === null
  ) {
    return;
  }

  revealCurrent(
    current
  );

  const left =
    placed[
      selectedSlot - 1
    ];

  const right =
    placed[
      selectedSlot
    ];

  const leftOK =
    !left ||
    current.year >=
      left.year;

  const rightOK =
    !right ||
    current.year <=
      right.year;

  const correctPlacement =
    leftOK &&
    rightOK;

  if (correctPlacement) {
    placed.splice(
      selectedSlot,
      0,
      current
    );

    correct++;

    showFeedback(
      true,
      `Riktig! ${current.title} skjedde i ${current.displayYear}.`
    );

  } else {
    wrong++;

    let correctIndex =
      0;

    while (
      correctIndex <
        placed.length &&
      placed[
        correctIndex
      ].year <
        current.year
    ) {
      correctIndex++;
    }

    const before =
      placed[
        correctIndex - 1
      ]?.displayYear;

    const after =
      placed[
        correctIndex
      ]?.displayYear;

    let where =
      "";

    if (
      before &&
      after
    ) {
      where =
        `mellom ${before} og ${after}`;
    } else if (before) {
      where =
        `etter ${before}`;
    } else if (after) {
      where =
        `før ${after}`;
    }

    showFeedback(
      false,
      `Ikke riktig plassering. Hendelsen skjedde i ${current.displayYear} og skulle vært ${where}.`
    );
  }

  resolved =
    true;

  renderTimeline();

  afterAnswer();
}


/* =========================================================
   ÅRSTALL / ÅRSSPENN
========================================================= */

function getYearAnswerResult(
  event,
  guess,
  tolerance
) {

  /*
    Kort med acceptedYearRange
    godkjenner hele intervallet.
  */

  if (
    event.acceptedYearRange &&
    Number.isFinite(
      event.acceptedYearRange.start
    ) &&
    Number.isFinite(
      event.acceptedYearRange.end
    )
  ) {
    const start =
      Math.min(
        event.acceptedYearRange.start,
        event.acceptedYearRange.end
      );

    const end =
      Math.max(
        event.acceptedYearRange.start,
        event.acceptedYearRange.end
      );

    let distance =
      0;

    if (
      guess <
      start
    ) {
      distance =
        start - guess;
    } else if (
      guess >
      end
    ) {
      distance =
        guess - end;
    }

    return {
      isCorrect:
        distance <= tolerance,

      distance,

      description:
        event.displayYear
    };
  }

  /*
    Kort med flere konkrete
    godkjente år.
  */

  const acceptedYears =
    Array.isArray(
      event.acceptedYears
    ) &&
    event.acceptedYears.length

      ? event.acceptedYears

      : [event.year];

  const distance =
    Math.min(
      ...acceptedYears.map(
        year =>
          Math.abs(
            guess - year
          )
      )
    );

  return {
    isCorrect:
      distance <= tolerance,

    distance,

    description:
      event.displayYear
  };
}

function submitYear(event) {
  event.preventDefault();

  if (
    resolved ||
    !current
  ) {
    return;
  }

  const guess =
    Number(
      yearInput.value
    );

  if (
    !Number.isFinite(
      guess
    ) ||
    !Number.isInteger(
      guess
    )
  ) {
    showFeedback(
      false,
      "Skriv inn et helt årstall."
    );

    return;
  }

  const tolerance =
    mode === "ten"
      ? 10
      : 0;

  const result =
    getYearAnswerResult(
      current,
      guess,
      tolerance
    );

  revealCurrent(
    current
  );

  if (
    result.isCorrect
  ) {
    correct++;

    if (
      mode === "exact"
    ) {
      showFeedback(
        true,
        `Riktig! Godkjent datering er ${result.description}.`
      );

    } else if (
      result.distance === 0
    ) {
      showFeedback(
        true,
        `Riktig! ${guess} ligger innenfor den godkjente dateringen (${result.description}).`
      );

    } else {
      showFeedback(
        true,
        `Riktig! Du er ${result.distance} år fra nærmeste godkjente datering (${result.description}).`
      );
    }

  } else {
    wrong++;

    if (
      mode === "exact"
    ) {
      showFeedback(
        false,
        `Ikke helt. Godkjent datering er ${result.description}.`
      );

    } else {
      showFeedback(
        false,
        `Ikke helt. Du svarte ${guess}; hendelsen er datert til ${result.description}.`
      );
    }
  }

  resolved =
    true;

  afterAnswer();
}


/* =========================================================
   ÅRHUNDRE / ÅRTUSEN
========================================================= */

function makeChoices() {
  choiceGrid.innerHTML =
    "";

  const getLabel =
    mode === "century"
      ? centuryLabel
      : millenniumLabel;

  const correctNumber =
    mode === "century"
      ? centuryNumber(
          current.year
        )
      : millenniumNumber(
          current.year
        );

  const size =
    mode === "century"
      ? 100
      : 1000;

  const choices =
    new Set([
      getLabel(
        current.year
      )
    ]);

  for (
    let difference = 1;
    choices.size < 4 &&
    difference < 8;
    difference++
  ) {
    const possibleNumbers = [
      Math.max(
        1,
        correctNumber -
          difference
      ),

      correctNumber +
        difference
    ];

    for (
      const number
      of possibleNumbers
    ) {
      const sign =
        current.year < 0
          ? -1
          : 1;

      const fakeYear =
        sign *
        (
          (number - 1) *
          size +
          1
        );

      choices.add(
        getLabel(
          fakeYear
        )
      );

      if (
        choices.size >= 4
      ) {
        break;
      }
    }
  }

  shuffle(
    [...choices]
  )
    .slice(
      0,
      4
    )
    .forEach(
      label => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "choice-btn";

        button.textContent =
          label;

        button.addEventListener(
          "click",
          () =>
            answerChoice(
              label
            )
        );

        choiceGrid.appendChild(
          button
        );
      }
    );
}

function answerChoice(label) {
  if (
    resolved ||
    !current
  ) {
    return;
  }

  const correctLabel =
    mode === "century"
      ? centuryLabel(
          current.year
        )
      : millenniumLabel(
          current.year
        );

  const isCorrect =
    label ===
    correctLabel;

  revealCurrent(
    current
  );

  if (isCorrect) {
    correct++;

    showFeedback(
      true,
      `Riktig! ${current.displayYear} ligger i ${correctLabel}.`
    );

  } else {
    wrong++;

    showFeedback(
      false,
      `Ikke helt. ${current.displayYear} ligger i ${correctLabel}.`
    );
  }

  resolved =
    true;

  choiceGrid
    .querySelectorAll(
      "button"
    )
    .forEach(
      button => {
        button.disabled =
          true;

        if (
          button.textContent ===
          correctLabel
        ) {
          button.classList.add(
            "selected"
          );
        }
      }
    );

  afterAnswer();
}

function afterAnswer() {
  updateStats();
  updateStage();

  nextBtn.disabled =
    false;

  checkBtn.disabled =
    true;
}

function showFeedback(
  isCorrect,
  text
) {
  feedback.className =
    `feedback show ${
      isCorrect
        ? "ok"
        : "no"
    }`;

  feedback.textContent =
    text;
}

function updateStats() {
  $("correct").textContent =
    correct;

  $("wrong").textContent =
    wrong;

  $("left").textContent =
    deck.length;
}

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

function openInfo() {
  if (!current) {
    return;
  }

  infoTitle.textContent =
    current.title;

  infoText.textContent =
    current.info ||
    "Ingen forklaring er lagt inn ennå.";

  infoOverlay.classList.add(
    "show"
  );

  $("infoClose").focus();
}

function closeInfo() {
  infoOverlay.classList.remove(
    "show"
  );

  infoBtn.focus();
}


/* =========================================================
   KONTROLLER
========================================================= */

$("modeSelect").addEventListener(
  "change",
  event => {
    mode =
      event.target.value;

    setModeUI();

    if (roundActive) {
      prepareSetup(
        "Spillemodus er endret. Velg nivåer og trykk Start spill."
      );
    }
  }
);

startBtn.addEventListener(
  "click",
  () => {
    /*
      Hvis et spill allerede pågår,
      avsluttes runden først slik at
      eleven kan velge nye nivåer.
    */

    if (roundActive) {
      prepareSetup(
        "Velg nivåene du vil bruke i den nye runden, og trykk Start spill."
      );

    } else {
      startGame();
    }
  }
);

nextBtn.addEventListener(
  "click",
  drawNext
);

checkBtn.addEventListener(
  "click",
  checkTimeline
);

yearForm.addEventListener(
  "submit",
  submitYear
);

$("rulesBtn").addEventListener(
  "click",
  () => {
    $("rules").classList.toggle(
      "show"
    );
  }
);

infoBtn.addEventListener(
  "click",
  openInfo
);

$("infoClose").addEventListener(
  "click",
  closeInfo
);

infoOverlay.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      infoOverlay
    ) {
      closeInfo();
    }
  }
);

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key ===
        "Escape" &&
      infoOverlay
        .classList
        .contains(
          "show"
        )
    ) {
      closeInfo();
    }
  }
);

[1, 2, 3].forEach(
  level => {
    const box =
      $(
        `difficulty${level}`
      );

    if (box) {
      box.addEventListener(
        "change",
        clearDifficultyError
      );
    }
  }
);

const backgroundSelect =
  $("backgroundSelect");

if (backgroundSelect) {
  backgroundTheme =
    backgroundSelect.value ||
    "height";

  backgroundSelect.addEventListener(
    "change",
    event => {
      backgroundTheme =
        event.target.value;

      updateStage();
    }
  );
}

mode =
  $("modeSelect")?.value ||
  "timeline";

setModeUI();

prepareSetup();
