(() => {
  function isBetterEntry(candidate, previous) {
    return candidate.total > previous.total ||
      (candidate.total === previous.total && candidate.wrong < previous.wrong) ||
      (candidate.total === previous.total && candidate.wrong === previous.wrong && candidate.correct > previous.correct);
  }

  function rankEntries(entries) {
    const bestByUser = new Map();
    entries.forEach(entry => {
      if (UsernamePolicy.isBlocked(entry.username)) return;
      const previous = bestByUser.get(entry.username);
      if (!previous || isBetterEntry(entry, previous)) bestByUser.set(entry.username, entry);
    });
    return [...bestByUser.values()]
      .sort((left, right) => right.total - left.total || left.wrong - right.wrong || right.correct - left.correct)
      .slice(0, 5);
  }

  function render(list, entries) {
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
      if (index === 0) {
        const crown = document.createElement("span");
        crown.textContent = "👑 ";
        crown.setAttribute("role", "img");
        crown.setAttribute("aria-label", "Førsteplass");
        item.querySelector("strong").prepend(crown);
      }
      item.querySelector(".leaderboard-score").textContent = `Tidslinjestørrelse: ${entry.total} kort · Antall feil: ${entry.wrong}`;
      list.appendChild(item);
    });
  }

  async function load() {
    if (location.protocol === "file:") return { entries: null, message: "" };

    const supabaseClient = window.tidslinjenSupabase;
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("round_results")
        .select("username, points, correct, wrong, total, mode, created_at")
        .like("mode", "%:lives:all")
        .order("total", { ascending: false })
        .order("wrong", { ascending: true })
        .order("correct", { ascending: false });
      if (error) return { entries: null, message: "Topplisten er ikke tilgjengelig akkurat nå." };
      return { entries: rankEntries(data || []), message: "Felles toppliste for alle spillere." };
    }

    if (location.hostname.endsWith("github.io")) {
      return { entries: null, message: "Felles toppliste er ikke konfigurert ennå." };
    }

    const apiOrigin = location.hostname === "localhost" && location.port === "8080"
      ? "http://localhost:3000"
      : "";
    try {
      const response = await fetch(`${apiOrigin}/api/leaderboard`, { credentials: "include" });
      if (!response.ok) return { entries: null, message: "Topplisten er ikke tilgjengelig akkurat nå." };
      const result = await response.json();
      if (!Array.isArray(result.entries)) {
        return { entries: null, message: "Topplisten er ikke tilgjengelig akkurat nå." };
      }
      return { entries: result.entries, message: "" };
    } catch {
      return { entries: null, message: "Topplisten er ikke tilgjengelig akkurat nå." };
    }
  }

  window.TimelineLeaderboard = { isBetterEntry, load, render };
})();
