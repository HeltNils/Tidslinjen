const events = window.TIMELINE_EVENTS || [];

if (!events.length) {
  console.error("Hendelsesbanken kunne ikke lastes.");
}

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
let points = 1000;
let hintPurchased = false;
let lastPoints = null;
let wrong = 0;
let resolved = true;
let mode = "timeline";
let backgroundTheme = "height";
let roundActive = false;
let roundCards = [];
let rareRoundCard = null;
let mistakes = [];
let roundSeed = null;
let automaticallySolved = false;
let lifeMode = "normal";
let lives = 3;
let livesBought = 0;
let lastLifeLoss = 0;

const $ = id => document.getElementById(id);

const timeline = $("timeline");
const timelineViewBtn = $("timelineViewBtn");
let timelineView = "normal";

function fitTimeline() {
  const scroller = timeline.parentElement;
  timeline.style.transform = "";
  scroller.style.height = "";
  if (timelineView !== "zoom" || !scroller.clientWidth) return;

  const scale = Math.min(1, (scroller.clientWidth - 4) / timeline.scrollWidth);
  timeline.style.transform = `scale(${scale})`;
  scroller.style.height = `${Math.ceil(timeline.offsetHeight * scale) + 17}px`;
}

function setTimelineView(view) {
  timelineView = view;
  $("timelineArea").classList.toggle("expanded", view === "rows");
  $("timelineArea").classList.toggle("zoomed", view === "zoom");
  timelineViewBtn.setAttribute("aria-pressed", String(view !== "normal"));
  timelineViewBtn.textContent = {
    normal: "Vis hele tidslinjen",
    rows: "Zoom ut til hele tidslinjen",
    zoom: "Vis tidslinjen i vanlig størrelse"
  }[view];
  $("timelineViewHint").classList.toggle("hidden", view === "normal");
  $("timelineViewHint").textContent = view === "rows"
    ? "Les fra venstre mot høyre, rad for rad ovenfra og ned."
    : "Hele tidslinjen vises på én rad. Bytt til vanlig størrelse for å lese små kort.";
  fitTimeline();
}

timelineViewBtn.addEventListener("click", () => {
  setTimelineView({ normal: "rows", rows: "zoom", zoom: "normal" }[timelineView]);
});

window.addEventListener("resize", fitTimeline);
timeline.addEventListener("load", fitTimeline, true);
let timelineContainerWidth = 0;
new ResizeObserver(entries => {
  const width = entries[0].contentRect.width;
  if (width !== timelineContainerWidth) {
    timelineContainerWidth = width;
    fitTimeline();
  }
}).observe(timeline.parentElement);

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
const lifeModeSelect = $("lifeModeSelect");
const buyLifeBtn = $("buyLifeBtn");
const yearRangeEnabled = $("yearRangeEnabled");
const yearRangeFields = $("yearRangeFields");
const yearRangeError = $("yearRangeError");
const yearRangeStart = $("yearRangeStart");
const yearRangeEnd = $("yearRangeEnd");
const yearRangeStartEra = $("yearRangeStartEra");
const yearRangeEndEra = $("yearRangeEndEra");

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
  $("autoSolveBtn").classList.toggle("hidden", mode !== "timeline");
  $("autoSolveBtn").disabled = !roundActive;
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

function getPlayableEvents(includeRare = false) {
  const selectedLevels =
    getSelectedDifficulties();

  let filtered =
    events.filter(event =>
      selectedLevels.includes(
        Number(event.difficulty)
      ) && (includeRare || !event.specialChance) && ($("historyScope").value !== "norway" || event.topics?.includes("norsk-historie"))
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

  const yearBounds = getYearBounds();
  if (yearBounds) {
    filtered = filtered.filter(event =>
      Number.isFinite(event.year) &&
      event.year >= yearBounds.start &&
      event.year <= yearBounds.end
    );
  }

  return filtered;
}

function getYearBounds() {
  if (!yearRangeEnabled.checked) return null;
  const start = Number(yearRangeStart.value) * (yearRangeStartEra.value === "bce" ? -1 : 1);
  const end = Number(yearRangeEnd.value) * (yearRangeEndEra.value === "bce" ? -1 : 1);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) return null;
  return { start, end };
}

function validateYearRange() {
  if (!yearRangeEnabled.checked) {
    yearRangeError.textContent = "";
    return true;
  }
  const start = Number(yearRangeStart.value) * (yearRangeStartEra.value === "bce" ? -1 : 1);
  const end = Number(yearRangeEnd.value) * (yearRangeEndEra.value === "bce" ? -1 : 1);
  const valid = Number.isInteger(start) && Number.isInteger(end) && start <= end;
  yearRangeError.textContent = valid ? "" : "Velg et gyldig tidsrom der startåret kommer før sluttåret.";
  return valid;
}

function updateYearRangeUI() {
  yearRangeFields.classList.toggle("hidden", !yearRangeEnabled.checked);
  validateYearRange();
}

function prepareSetup(
  message =
    "Velg spillemodus og vanskelighetsgrad, og start en ny runde."
) {
  roundActive = false;
  showCardVariant(null);
  lastLifeLoss = 0;
  $("roundSummary").classList.add("hidden");
  points = 1000;
  lifeMode = lifeModeSelect.value;
  lives = 3;
  livesBought = 0;
  resetHint();
  lastPoints = null;
  $("roundLength").disabled = false;
  $("historyScope").disabled = false;
  $("quickStartBtn").disabled = false;
  nextBtn.textContent = "Trekk neste kort →";

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

function startGame(options = {}) {
  if (!events.length) {
    showFeedback(
      false,
      "Hendelsesbanken kunne ikke lastes. Sjekk events.js."
    );

    return;
  }

  const selectedLevels =
    getSelectedDifficulties();

  if (!selectedLevels.length && !options.cards) {
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
    options.cards || getPlayableEvents();

  if (!options.cards && !validateYearRange()) return;

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
  lastLifeLoss = 0;
  points = 1000;
  lifeMode = lifeModeSelect.value;
  lives = 3;
  livesBought = 0;
  resetHint();
  lastPoints = null;
  nextBtn.textContent = "Trekk neste kort →";
  automaticallySolved = false;
  mistakes = [];
  $("roundSummary").classList.add("hidden");
  $("roundLength").disabled = true;
  $("historyScope").disabled = true;
  $("quickStartBtn").disabled = true;

  startBtn.textContent =
    "↻ Ny runde / endre nivå";

  deck =
    shuffle(
      playableEvents
    );
  const limit = $("roundLength").value;
  if (!options.cards && limit !== "all") deck = deck.slice(0, Number(limit));
  roundCards = deck.slice();
  rareRoundCard = options.cards ? null : getPlayableEvents(true).find(card => card.specialChance) || null;
  roundSeed = options.seed || null;

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
    if (options.cards) {
      if (roundSeed) placed.push(roundSeed);
      drawNext();
      return;
    }
    current = { ...deck.pop(), variant: "normal" };
    roundSeed = current;

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

function autoSolveAll(code) {
  if (!roundActive || mode !== "timeline") return;
  if (code !== "Nils") {
    $("solveCodeError").textContent = "Feil kode. Prøv igjen.";
    $("solveCode").value = "";
    $("solveCode").focus();
    return;
  }
  $("solveDialog").close();
  $("solveCode").value = "";

  // Use this round's snapshot, including previously missed cards.
  placed = [...new Map([...roundCards, ...(roundSeed ? [roundSeed] : [])]
    .map(event => [event.bankId, event])).values()]
    .sort((a, b) => a.year - b.year);
  automaticallySolved = true;
  deck = [];
  selectedSlot = null;
  resolved = true;
  finishRound();
  renderTimeline();
  updateStats();

  if (timelineView === "normal") {
    setTimelineView("rows");
  }

  feedback.textContent =
    `Alle ${placed.length} kortene er plassert i riktig rekkefølge. Runden er fullført automatisk. Dine riktige og gale svar er beholdt.`;
}

$("autoSolveBtn").addEventListener("click", () => {
  if (!roundActive || mode !== "timeline") return;
  $("solveCode").value = "";
  $("solveCodeError").textContent = "";
  $("solveDialog").showModal();
  $("solveCode").focus();
});
$("solveCodeForm").addEventListener("submit", event => {
  event.preventDefault();
  autoSolveAll($("solveCode").value);
});
$("solveCancel").addEventListener("click", () => $("solveDialog").close());
$("solveDialog").addEventListener("close", () => {
  $("solveCode").value = "";
  $("solveCodeError").textContent = "";
});

function finishRound() {
  roundActive = false;
  resolved = true;
  resetHint();
  updateHintButton();
  $("roundLength").disabled = false;
  $("historyScope").disabled = false;
  $("quickStartBtn").disabled = false;
  $("autoSolveBtn").disabled = true;

  setDifficultyLocked(false);

  startBtn.textContent =
    "↻ Spill igjen";

  current = null;

  renderEmptyCurrent();
  renderRoundSummary();
  saveRoundResult();

  feedback.className =
    "feedback show ok";

  feedback.textContent =
    "Runden er ferdig! Du kan nå endre nivåene eller spille igjen.";

  nextBtn.disabled =
    true;

  checkBtn.disabled =
    true;
}

function loseLife() {
  if (lifeMode !== "lives") return false;
  const damage = ["corrupted", "hybrid"].includes(current?.variant) ? 2 : 1;
  lastLifeLoss = Math.min(lives, damage);
  lives = Math.max(0, lives - damage);
  updateStats();
  if (lives === 0) {
    feedback.textContent += " Alle livene er brukt opp.";
    return true;
  }
  return false;
}

function buyLife() {
  const price = 500 * (livesBought + 1);
  if (!roundActive || lifeMode !== "lives" || points < price) return;
  points -= price;
  lives++;
  livesBought++;
  feedback.className = "feedback show ok";
  feedback.textContent = `Du kjøpte ett liv for ${price.toLocaleString("nb-NO")} poeng.`;
  updateStats();
}

async function saveRoundResult() {
  if (automaticallySolved || !roundCards.length || lifeMode !== "lives" || $("roundLength").value !== "all") return;
  const cardsOnTimeline = mode === "timeline" ? placed.length : correct + wrong;
  const localOnly = location.hostname.endsWith("github.io");
  const supabaseClient = window.tidslinjenSupabase;
  if (supabaseClient) {
    const { data: authData } = await supabaseClient.auth.getSession();
    const user = authData.session?.user;
    if (!user) return;
    const username = user.user_metadata?.username || user.email?.split("@")[0] || "Spiller";
    await supabaseClient.from("round_results").insert({
      user_id: user.id,
      username,
      points,
      correct,
      wrong,
      total: cardsOnTimeline,
      mode: `${mode}:${lifeMode}:all`
    });
    loadLeaderboard();
    return;
  }
  if (localOnly && !supabaseClient) return;
  if (location.protocol === "file:") return;
  const apiOrigin = location.hostname === "localhost" && location.port === "8080"
    ? "http://localhost:3000"
    : "";
  try {
    await fetch(`${apiOrigin}/api/rounds`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points, correct, wrong, total: cardsOnTimeline, mode: `${mode}:${lifeMode}:all` })
    });
  } catch {
    // Guests and offline play do not have a server-side result to save.
  }
  loadLeaderboard();
}

function localLeaderboardEntries() {
  try {
    const entries = JSON.parse(localStorage.getItem("tidslinjen.local-leaderboard.v2")) ||
      JSON.parse(localStorage.getItem("tidslinjen.local-leaderboard.v1")) || [];
    const bestByUser = new Map();
    entries.forEach(entry => {
      const previous = bestByUser.get(entry.username);
      if (!previous || isBetterLeaderboardEntry(entry, previous)) bestByUser.set(entry.username, entry);
    });
    return [...bestByUser.values()]
      .sort((left, right) => right.total - left.total || left.wrong - right.wrong || right.correct - left.correct)
      .slice(0, 5);
  } catch {
    return [];
  }
}

function isBetterLeaderboardEntry(candidate, previous) {
  return candidate.total > previous.total ||
    (candidate.total === previous.total && candidate.wrong < previous.wrong) ||
    (candidate.total === previous.total && candidate.wrong === previous.wrong && candidate.correct > previous.correct);
}

function saveLocalLeaderboardEntry() {
  let account;
  try {
    account = JSON.parse(localStorage.getItem("tidslinjen.local-account.v1"));
  } catch {
    account = null;
  }
  const username = account?.session?.username;
  if (!username) return;
  let entries;
  try {
    entries = JSON.parse(localStorage.getItem("tidslinjen.local-leaderboard.v2")) || [];
  } catch {
    entries = [];
  }
  entries.push({ username, points, correct, wrong, total: mode === "timeline" ? placed.length : correct + wrong, mode: `${mode}:lives:all` });
  localStorage.setItem("tidslinjen.local-leaderboard.v2", JSON.stringify(entries));
}

function renderLeaderboard(entries) {
  const list = $("leaderboardList");
  list.replaceChildren();
  if (!entries.length) {
    const item = document.createElement("li");
    item.className = "leaderboard-empty";
    item.textContent = "Ingen registrerte resultater ennå.";
    list.appendChild(item);
    return;
  }
  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<span class="leaderboard-rank">${index + 1}</span><strong></strong><span class="leaderboard-score"></span>`;
    item.querySelector("strong").textContent = entry.username;
    item.querySelector(".leaderboard-score").textContent = `Tidslinjestørrelse: ${entry.total} kort · Antall feil: ${entry.wrong}`;
    list.appendChild(item);
  });
}

async function loadLeaderboard() {
  if (location.protocol === "file:") return;
  const supabaseClient = window.tidslinjenSupabase;
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("round_results")
      .select("username, points, correct, wrong, total, mode, created_at")
      .like("mode", "%:lives:all")
      .order("total", { ascending: false })
      .order("wrong", { ascending: true })
      .order("correct", { ascending: false });
    if (error) {
      $("leaderboardMessage").textContent = "Topplisten er ikke tilgjengelig akkurat nå.";
      return;
    }
    const bestByUser = new Map();
    (data || []).forEach(entry => {
      if (UsernamePolicy.isBlocked(entry.username)) return;
      const previous = bestByUser.get(entry.username);
      if (!previous || isBetterLeaderboardEntry(entry, previous)) bestByUser.set(entry.username, entry);
    });
    const entries = [...bestByUser.values()]
      .sort((left, right) => right.total - left.total || left.wrong - right.wrong || right.correct - left.correct)
      .slice(0, 5);
    renderLeaderboard(entries);
    $("leaderboardMessage").textContent = "Felles toppliste for alle spillere.";
    return;
  }
  const localOnly = location.hostname.endsWith("github.io");
  if (localOnly && !supabaseClient) {
    $("leaderboardMessage").textContent = "Felles toppliste er ikke konfigurert ennå.";
    return;
  }
  const apiOrigin = location.hostname === "localhost" && location.port === "8080"
    ? "http://localhost:3000"
    : "";
  const message = $("leaderboardMessage");
  try {
    const response = await fetch(`${apiOrigin}/api/leaderboard`, { credentials: "include" });
    if (!response.ok) throw new Error();
    renderLeaderboard((await response.json()).entries || []);
    message.textContent = "";
  } catch {
    message.textContent = "Topplisten er ikke tilgjengelig akkurat nå.";
  }
}

$("leaderboardRefresh").addEventListener("click", loadLeaderboard);
window.addEventListener("tidslinjen:session", loadLeaderboard);
loadLeaderboard();

function renderRoundSummary() {
  const result = TimelineLearning.summarize(correct, wrong, mistakes);
  $("summaryTitle").textContent = automaticallySolved ? "Runden er løst automatisk" : "Runden er ferdig!";
  $("summaryPoints").textContent = `${points.toLocaleString("nb-NO")} poeng`;
  $("summaryScore").textContent = result.total
    ? `${correct}/${result.total} riktige – ${result.percent} %`
    : "Ingen egne svar i denne runden";
  $("summaryDetail").textContent = `${correct} riktige · ${wrong} feil. ` +
    (automaticallySolved ? "Bare dine egne svar inngår i resultatet. " : "") +
    (mode === "timeline" ? "Startkortet teller ikke som et svar." : "");
  $("summaryPeriods").replaceChildren();
  result.periods.forEach(([period, count]) => {
    const item = document.createElement("li");
    item.textContent = `${period}: ${count} feil`;
    $("summaryPeriods").appendChild(item);
  });
  $("retryBtn").classList.toggle("hidden", !mistakes.length);
  $("retryBtn").textContent = `Øv på de ${mistakes.length} du bommet på`;
  $("roundSummary").classList.remove("hidden");
  $("roundSummary").focus({ preventScroll: true });
}

function drawNext() {
  resetHint();
  if (!deck.length) {
    finishRound();

    return;
  }

  let drawn = deck.pop();
  if (TimelineLearning.rollRareCard(rareRoundCard)) {
    const index = roundCards.findIndex(card => card.bankId === drawn.bankId);
    drawn = rareRoundCard;
    if (index !== -1) roundCards[index] = drawn;
    rareRoundCard = null;
  }
  current = TimelineLearning.drawCard(drawn);

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

function showCardVariant(event) {
  const variant = ["shiny", "corrupted", "hybrid"].includes(event?.variant || event?.fixedVariant) ? (event.variant || event.fixedVariant) : "normal";
  $("currentCard").dataset.variant = variant;
  $("currentVariant").classList.toggle("hidden", variant === "normal");
  $("currentVariant").textContent = variant === "hybrid" ? "✦◆ Shiny + Corrupted" : variant === "shiny" ? "✦ Shiny" : variant === "corrupted" ? "◆ Corrupted" : "";
  $("variantEffect").textContent = variant === "hybrid"
    ? `Hybrid: 4× poeng ved riktig svar · ${lifeMode === "lives" ? "feil koster 2 liv." : "ingen livtrekk i vanlig spill."}`
    : variant === "normal" ? "" : variant === "shiny"
    ? "Shiny: 2× poeng ved riktig svar."
    : lifeMode === "lives"
      ? "Corrupted: 2× poeng ved riktig svar · feil koster 2 liv."
      : "Corrupted: 2× poeng ved riktig svar · ingen livtrekk i vanlig spill.";
}

function showCurrent(event) {
  showCardVariant(event);
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
  showCardVariant(null);
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
  requestAnimationFrame(fitTimeline);
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
  element.tabIndex = 0;
  element.setAttribute("role", "button");
  element.setAttribute("aria-haspopup", "dialog");
  element.setAttribute("aria-label", `Les om ${event.title}, ${event.displayYear}`);
  element.title = "Klikk for å lese om hendelsen";
  element.addEventListener("click", () => openInfo(event, element));
  element.addEventListener("keydown", keyEvent => {
    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
      keyEvent.preventDefault();
      openInfo(event, element);
    }
  });
  if (["shiny", "corrupted", "hybrid"].includes(event.variant || event.fixedVariant)) element.dataset.variant = event.variant || event.fixedVariant;

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
    <span class="mini-read-more" aria-hidden="true">ⓘ Les om hendelsen</span>
  `;

  if (element.dataset.variant) {
    const badge = document.createElement("span");
    badge.className = "variant-badge mini-variant";
    badge.textContent = element.dataset.variant === "hybrid" ? "✦◆ Hybrid" : event.variant === "shiny" ? "✦ Shiny" : "◆ Corrupted";
    element.prepend(badge);
  }
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
    resolved ||
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
    awardPoints([left, right]);
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
    mistakes.push(current);
    loseLife();

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
    awardPoints();
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
    mistakes.push(current);
    loseLife();

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
    awardPoints();
    correct++;

    showFeedback(
      true,
      `Riktig! ${current.displayYear} ligger i ${correctLabel}.`
    );

  } else {
    wrong++;
    mistakes.push(current);
    loseLife();

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
  updateHintButton();
  if (lastPoints) {
    feedback.textContent += ` +${lastPoints.total} poeng (${lastPoints.base} grunnpoeng` +
      (lastPoints.bonus ? ` + ${lastPoints.bonus} nærhetsbonus` : "") +
      (lastPoints.multiplier > 1 ? `, ×${lastPoints.multiplier} ${current.variant === "hybrid" ? "Hybrid" : current.variant === "shiny" ? "Shiny" : "Corrupted"}).` : ").");
    lastPoints = null;
  }
  if (lastLifeLoss) {
    feedback.textContent += ` ${current?.variant === "corrupted" ? "Corrupted! " : ""}Du mistet ${lastLifeLoss} liv.`;
    lastLifeLoss = 0;
  }
  updateStats();
  updateStage();

  nextBtn.disabled =
    false;

  checkBtn.disabled =
    true;
  if (lifeMode === "lives" && lives === 0) {
    const answerFeedback = feedback.textContent;
    finishRound();
    feedback.className = "feedback show no";
    feedback.textContent = `${answerFeedback} Alle livene er brukt opp. Runden er ferdig.`;
    return;
  }
  nextBtn.textContent = deck.length ? "Trekk neste kort →" : "Se resultat →";
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

function resetHint() {
  hintPurchased = false;
  $("hintText").textContent = "";
}

function updateHintButton() {
  const button = $("hintBtn");
  const choicesMode = mode === "century" || mode === "millennium";
  button.disabled = !roundActive || resolved || !current || hintPurchased || points < 500;
  button.textContent = hintPurchased ? "Hint kjøpt" : points < 500 ? "Hint krever 500 poeng" : "Kjøp hint – 500 poeng";
  $("hintDescription").textContent = choicesMode
    ? "Fjerner opptil to gale svaralternativer."
    : "Viser starten av årstallet og f.Kr./e.Kr. Korte årstall får et tiårsintervall. Hintet bruker hovedåret ved omtrentlige dateringer.";
}

function buyHint() {
  if (!roundActive || resolved || !current || hintPurchased || points < 500) return;
  let text;
  if (mode === "century" || mode === "millennium") {
    const correctLabel = mode === "century" ? centuryLabel(current.year) : millenniumLabel(current.year);
    const wrongChoices = [...choiceGrid.querySelectorAll("button")]
      .filter(button => !button.disabled && button.textContent !== correctLabel);
    // Always leave the correct answer and at least one distractor.
    const removed = shuffle(wrongChoices).slice(0, Math.min(2, wrongChoices.length - 1));
    if (!removed.length) return;
    removed.forEach(button => { button.disabled = true; });
    text = `${removed.length} gale svaralternativer er fjernet.`;
  } else {
    text = TimelineLearning.yearHint(current);
  }
  points -= 500;
  hintPurchased = true;
  $("hintText").textContent = `${text} (−500 poeng)`;
  updateStats();
}

$("hintBtn").addEventListener("click", buyHint);
buyLifeBtn.addEventListener("click", buyLife);

function awardPoints(neighbors = []) {
  lastPoints = TimelineLearning.scorePlacement(current, neighbors);
  points += lastPoints.total;
}

function updateStats() {
  updateHintButton();
  $("points").textContent = points.toLocaleString("nb-NO");
  $("correct").textContent =
    correct;

  $("wrong").textContent =
    wrong;

  updateLifeModeUI();

  $("left").textContent =
    deck.length;
}

function updateLifeModeUI() {
  const livesEnabled = lifeMode === "lives";
  $("lives").textContent = lives;
  $("livesStat").classList.toggle("hidden", !livesEnabled);
  const lifePrice = 500 * (livesBought + 1);
  buyLifeBtn.classList.toggle("hidden", !livesEnabled);
  buyLifeBtn.disabled = !roundActive || points < lifePrice;
  buyLifeBtn.textContent = `Kjøp ekstra liv – ${lifePrice.toLocaleString("nb-NO")} poeng`;
}

let infoOpener = null;

function openInfo(card = current, opener = infoBtn) {
  if (!card) {
    return;
  }
  infoOpener = opener;
  $("infoYear").textContent = opener === infoBtn ? "" : card.displayYear;
  $("infoYear").classList.toggle("hidden", opener === infoBtn);

  infoTitle.textContent =
    card.title;

  infoText.textContent =
    card.info ||
    "Ingen forklaring er lagt inn ennå.";
  const source = $("infoSource");
  source.replaceChildren();
  source.classList.add("hidden");
  if (card.sourceLabel || card.sourceUrl) {
    source.textContent = "Kilde: ";
    let url;
    try { url = new URL(card.sourceUrl); } catch { /* Invalid or missing URL. */ }
    if (url && ["https:", "http:"].includes(url.protocol)) {
      const link = document.createElement("a");
      link.href = url.href;
      link.textContent = card.sourceLabel || url.hostname;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      source.appendChild(link);
    } else {
      source.append(document.createTextNode(card.sourceLabel || "Ingen gyldig lenke"));
    }
    source.classList.remove("hidden");
  }

  infoOverlay.classList.add(
    "show"
  );

  $("infoClose").focus();
}

function closeInfo() {
  infoOverlay.classList.remove(
    "show"
  );

  if (infoOpener?.isConnected) infoOpener.focus();
  else if (!infoBtn.disabled) infoBtn.focus();
  infoOpener = null;
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

    prepareSetup(
        "Spillemodus er endret. Velg nivåer og trykk Start spill."
      );
  }
);

lifeModeSelect.addEventListener("change", () => {
  if (roundActive) {
    prepareSetup("Spilltype er endret. Velg spilltype og trykk Start spill.");
  } else {
    lifeMode = lifeModeSelect.value;
    updateLifeModeUI();
    savePreferences();
  }
});

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
  () => openInfo()
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

const revealKeys = new Set();
const revealCombination = new Set(["e", "l", "y"]);

document.addEventListener(
  "keydown",
  event => {
    const typingTarget = event.target.matches?.(
      "input, textarea, select, [contenteditable=\"true\"]"
    );

    if (!typingTarget && revealCombination.has(event.key.toLowerCase())) {
      revealKeys.add(event.key.toLowerCase());

      if ([...revealCombination].every(key => revealKeys.has(key))) {
        $("cornerPhoto").classList.remove("hidden");
      }
    }

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

document.addEventListener(
  "keyup",
  event => {
    revealKeys.delete(event.key.toLowerCase());
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

function savePreferences() {
  TimelineLearning.saveSettings({
    mode: $("modeSelect").value,
    background: $("backgroundSelect").value,
    length: $("roundLength").value,
    historyScope: $("historyScope").value,
    lifeMode: lifeModeSelect.value,
    yearRangeEnabled: yearRangeEnabled.checked,
    yearRangeStart: Number(yearRangeStart.value),
    yearRangeEnd: Number(yearRangeEnd.value),
    yearRangeStartEra: yearRangeStartEra.value,
    yearRangeEndEra: yearRangeEndEra.value,
    difficulties: getSelectedDifficulties()
  });
}

const preferences = TimelineLearning.readSettings();
for (const [id, key] of [["modeSelect", "mode"], ["backgroundSelect", "background"], ["roundLength", "length"], ["lifeModeSelect", "lifeMode"], ["historyScope", "historyScope"]]) {
  const select = $(id);
  if ([...select.options].some(option => option.value === preferences[key])) select.value = preferences[key];
  select.addEventListener("change", savePreferences);
}

for (const control of [yearRangeEnabled, yearRangeStart, yearRangeEnd, yearRangeStartEra, yearRangeEndEra]) {
  control.addEventListener("change", () => {
    updateYearRangeUI();
    savePreferences();
  });
}

const rangePreferences = TimelineLearning.readSettings();
yearRangeEnabled.checked = rangePreferences.yearRangeEnabled === true;
yearRangeStart.value = Number.isInteger(rangePreferences.yearRangeStart) ? rangePreferences.yearRangeStart : 1000;
yearRangeEnd.value = Number.isInteger(rangePreferences.yearRangeEnd) ? rangePreferences.yearRangeEnd : 1200;
if (["bce", "ce"].includes(rangePreferences.yearRangeStartEra)) yearRangeStartEra.value = rangePreferences.yearRangeStartEra;
if (["bce", "ce"].includes(rangePreferences.yearRangeEndEra)) yearRangeEndEra.value = rangePreferences.yearRangeEndEra;
updateYearRangeUI();
if (Array.isArray(preferences.difficulties) && preferences.difficulties.some(level => [1, 2, 3].includes(level))) {
  [1, 2, 3].forEach(level => { $(`difficulty${level}`).checked = preferences.difficulties.includes(level); });
}
[1, 2, 3].forEach(level => $(`difficulty${level}`).addEventListener("change", savePreferences));

$("quickStartBtn").addEventListener("click", () => {
  if (roundActive) return;
  $("modeSelect").value = "timeline";
  mode = "timeline";
  $("roundLength").value = "10";
  [1, 2, 3].forEach(level => { $(`difficulty${level}`).checked = true; });
  savePreferences();
  startGame();
});

$("retryBtn").addEventListener("click", () => {
  if (roundActive || !mistakes.length) return;
  startGame({ cards: mistakes.slice(), seed: roundSeed });
});

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
