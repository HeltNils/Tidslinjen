/* Achievements: medals per trinn, independent of the game interface. */
(function (root) {
  const STORAGE_KEY = "tidslinjen.achievements.v1";
  // Highest first: the first tier whose threshold is met is the one earned.
  const TIERS = [
    { id: "gold", label: "Gull", min: 100, icon: "🥇" },
    { id: "silver", label: "Sølv", min: 75, icon: "🥈" },
    { id: "bronze", label: "Bronse", min: 50, icon: "🥉" }
  ];
  const SCOPES = [
    { id: "all", label: "All historie" },
    { id: "grade8", label: "8. trinn" },
    { id: "grade9", label: "9. trinn" },
    { id: "grade10", label: "10. trinn" },
    { id: "junior", label: "Ungdomsskolen" },
    { id: "norway", label: "Norsk historie" },
    { id: "bce", label: "Før vår tidsregning" }
  ];

  const rank = tierId => TIERS.length - TIERS.findIndex(tier => tier.id === tierId);

  // Integer comparison, so 99.6 % never rounds up to gold.
  function tierFor(correct, total) {
    if (!(total > 0) || !(correct >= 0)) return null;
    return TIERS.find(tier => correct * 100 >= tier.min * total)?.id || null;
  }

  function read(storage = root.localStorage) {
    try {
      const value = JSON.parse(storage.getItem(STORAGE_KEY));
      return value && typeof value === "object" ? value : {};
    } catch { return {}; }
  }

  function write(data, storage = root.localStorage) {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch { /* Playing also works when browser storage is unavailable. */ }
  }

  // Returns { scope, tier, previous, upgraded, percent }; medals are only ever upgraded.
  function record(scope, correct, total, storage = root.localStorage, now = new Date()) {
    if (!SCOPES.some(item => item.id === scope)) return null;
    const tier = tierFor(correct, total);
    const percent = total > 0 ? Math.round(correct / total * 100) : 0;
    const data = read(storage);
    const entry = data[scope] || {};
    const previous = entry.tier || null;
    const upgraded = Boolean(tier) && (!previous || rank(tier) > rank(previous));
    if (tier) {
      if (upgraded) entry.tier = tier;
      entry.bestPercent = Math.max(entry.bestPercent || 0, percent);
      entry.updated = now.toISOString();
      data[scope] = entry;
      write(data, storage);
    }
    return { scope, tier, previous, upgraded, percent };
  }

  function render(container, storage = root.localStorage) {
    if (!container) return;
    const data = read(storage);
    container.replaceChildren(...SCOPES.map(scope => {
      const entry = data[scope.id] || {};
      const earned = entry.tier ? rank(entry.tier) : 0;
      const card = document.createElement("li");
      card.className = "achievement";
      card.dataset.scope = scope.id;
      const title = document.createElement("strong");
      title.textContent = scope.label;
      const medals = document.createElement("span");
      medals.className = "achievement-medals";
      [...TIERS].reverse().forEach(tier => {
        const medal = document.createElement("span");
        const unlocked = rank(tier.id) <= earned;
        medal.className = `achievement-medal ${tier.id}${unlocked ? " unlocked" : " locked"}`;
        medal.dataset.tier = tier.id;
        medal.textContent = "★";
        medal.title = `${tier.label}: ${tier.min} % riktig i én runde med alle kort i Liv-modus${unlocked ? " – oppnådd" : " – ikke oppnådd ennå"}`;
        medal.setAttribute("aria-label", medal.title);
        medals.appendChild(medal);
      });
      const best = document.createElement("small");
      best.textContent = entry.bestPercent ? `Beste: ${entry.bestPercent} %` : "Ikke spilt ennå";
      card.append(title, medals, best);
      return card;
    }));
  }

  const api = { STORAGE_KEY, TIERS, SCOPES, tierFor, read, record, render };
  root.TimelineAchievements = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
