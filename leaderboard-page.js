(() => {
  const list = document.getElementById("leaderboardList");
  const message = document.getElementById("leaderboardMessage");
  const refreshButton = document.getElementById("leaderboardRefresh");
  const config = window.SUPABASE_CONFIG;
  if (!window.tidslinjenSupabase && window.supabase?.createClient &&
      config?.url && config.publishableKey && !config.publishableKey.startsWith("PASTE_")) {
    window.tidslinjenSupabase = window.supabase.createClient(config.url, config.publishableKey);
  }

  async function refreshLeaderboard() {
    refreshButton.disabled = true;
    message.textContent = "Laster topplisten …";
    try {
      const result = await TimelineLeaderboard.load();
      if (result.entries === null) {
        list.replaceChildren();
        const item = document.createElement("li");
        item.className = "leaderboard-empty";
        item.textContent = location.protocol === "file:"
          ? "Åpne spillet fra nettadressen for å vise fellesresultater."
          : result.message;
        list.appendChild(item);
      } else {
        TimelineLeaderboard.render(list, result.entries);
      }
      message.textContent = result.message;
    } finally {
      refreshButton.disabled = false;
    }
  }

  refreshButton.addEventListener("click", refreshLeaderboard);
  refreshLeaderboard();
})();
