/* Achievements: medals per scope. Pure helpers; where the data is stored is decided by the caller. */
(function (root) {
  const STORAGE_PREFIX = "tidslinjen.achievements.v2.";
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
  const isScope = scope => SCOPES.some(item => item.id === scope);

  // Integer comparison, so 99.6 % never rounds up to gold.
  function tierFor(correct, total) {
    if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total) return null;
    return TIERS.find(tier => correct * 100 >= tier.min * total)?.id || null;
  }

  // Medals are only ever upgraded. `entries` maps scope -> { tier, bestPercent }.
  function evaluate(entries, scope, correct, total) {
    if (!isScope(scope)) return null;
    const tier = tierFor(correct, total);
    const percent = tier ? Math.round(correct / total * 100) : 0;
    const old = entries?.[scope] || {};
    const previous = old.tier || null;
    const upgraded = Boolean(tier) && (!previous || rank(tier) > rank(previous));
    const bestPercent = Math.max(old.bestPercent || 0, percent);
    const entry = tier ? { tier: upgraded ? tier : previous, bestPercent } : null;
    return { scope, tier, previous, upgraded, percent, entry };
  }

  function storageKey(username) { return STORAGE_PREFIX + String(username).toLocaleLowerCase("nb-NO"); }

  function read(username, storage = root.localStorage) {
    try {
      const value = JSON.parse(storage.getItem(storageKey(username)));
      return value && typeof value === "object" ? value : {};
    } catch { return {}; }
  }

  // Browser-storage backend for local accounts (no server).
  function record(username, scope, correct, total, storage = root.localStorage) {
    const data = read(username, storage);
    const result = evaluate(data, scope, correct, total);
    if (result?.entry) {
      data[scope] = result.entry;
      try { storage.setItem(storageKey(username), JSON.stringify(data)); }
      catch { /* Playing also works when browser storage is unavailable. */ }
    }
    return result;
  }

  // `entries` is null for guests: the medals are shown locked with a login hint.
  function render(container, entries) {
    if (!container) return;
    const signedIn = entries !== null && entries !== undefined;
    container.classList.toggle("guest", !signedIn);
    container.replaceChildren(...SCOPES.map(scope => {
      const entry = entries?.[scope.id] || {};
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
      best.textContent = !signedIn ? "Logg inn for å samle" : entry.bestPercent ? `Beste: ${entry.bestPercent} %` : "Ikke spilt ennå";
      card.append(title, medals, best);
      return card;
    }));
  }

  const api = { STORAGE_PREFIX, TIERS, SCOPES, isScope, tierFor, evaluate, read, record, render };
  root.TimelineAchievements = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
