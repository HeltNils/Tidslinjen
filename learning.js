/* Pure data helpers, independent of the game interface. */
window.TimelineLearning = {
  compareTimelineEvents(first, second) {
    if (first.year !== second.year) return first.year < second.year ? -1 : 1;
    if (first.timelineDate && second.timelineDate) {
      return first.timelineDate < second.timelineDate ? -1 : first.timelineDate > second.timelineDate ? 1 : 0;
    }
    return 0;
  },

  isValidTimelinePlacement(placed, event, index) {
    if (!Number.isInteger(index) || index < 0 || index > placed.length) return false;
    return placed.slice(0, index).every(card => this.compareTimelineEvents(card, event) <= 0) &&
      placed.slice(index).every(card => this.compareTimelineEvents(event, card) <= 0);
  },

  findTimelineInsertionIndex(placed, event) {
    for (let index = placed.length; index >= 0; index--) {
      if (this.isValidTimelinePlacement(placed, event, index)) return index;
    }
    throw new Error("Hendelsen kan ikke plasseres i denne tidslinjen.");
  },

  sortTimelineEvents(events) {
    const sorted = [];
    for (const event of events) {
      const index = this.findTimelineInsertionIndex(sorted, event);
      sorted.splice(index, 0, event);
    }
    return sorted;
  },

  formatTimelineDate(event) {
    if (!event.timelineDate) return event.displayYear || String(event.year);
    const date = new Date(`${event.timelineDate}T00:00:00Z`);
    return new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  },

  rollRareCard(card, random = Math.random) {
    return Boolean(card && random() < card.specialChance);
  },
  drawCard(event, random = Math.random) {
    if (event.fixedVariant === "hybrid") return { ...event, variant: "hybrid" };
    // One draw out of twenty for each special type; never both on the same card.
    const roll = Math.floor(random() * 20);
    return { ...event, variant: roll === 0 ? "shiny" : roll === 1 ? "corrupted" : "normal" };
  },

  yearHint(event) {
    const digits = String(Math.abs(event.year));
    const era = event.year < 0 ? "f.Kr." : "e.Kr.";
    if (digits.length <= 2) {
      const start = Math.floor(Math.abs(event.year) / 10) * 10;
      return `Kortets hovedår ligger mellom ${start} og ${start + 9} ${era}`;
    }
    const visible = Math.min(2, digits.length - 1);
    return `Kortets hovedår: ${digits.slice(0, visible)}${"•".repeat(digits.length - visible)} ${era}`;
  },

  scorePlacement(event, neighbors = []) {
    const base = [1, 2, 3].includes(Number(event.difficulty)) ? Number(event.difficulty) * 100 : 0;
    const distances = neighbors.filter(neighbor => neighbor && Number.isFinite(neighbor.year))
      .map(neighbor => Math.abs(event.year - neighbor.year));
    const distance = distances.length ? Math.min(...distances) : Infinity;
    const rate = distance <= 10 ? 1 : distance <= 50 ? 0.5 : distance <= 100 ? 0.25 : 0;
    const bonus = Math.round(base * rate);
    const multiplier = event.variant === "hybrid" ? 4 : ["shiny", "corrupted"].includes(event.variant) ? 2 : 1;
    return { base, bonus, multiplier, total: (base + bonus) * multiplier, distance };
  },

  validateEvents(events) {
    const issues = [];
    const ids = new Set();
    events.forEach((event, index) => {
      const label = event?.bankId || `Kort ${index + 1}`;
      if (!event || typeof event !== "object") {
        issues.push(`${label}: ugyldig kort`);
        return;
      }
      if (!Number.isFinite(event.year)) issues.push(`${label}: ugyldig year`);
      if (event.timelineDate !== undefined) {
        const validDate = typeof event.timelineDate === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(event.timelineDate) &&
          Number(event.timelineDate.slice(0, 4)) === event.year &&
          Number.isFinite(Date.parse(`${event.timelineDate}T00:00:00Z`)) &&
          new Date(`${event.timelineDate}T00:00:00Z`).toISOString().slice(0, 10) === event.timelineDate;
        if (!validDate) issues.push(`${label}: ugyldig timelineDate`);
      }
      if (![1, 2, 3].includes(event.difficulty)) issues.push(`${label}: ugyldig difficulty`);
      if (typeof event.title !== "string" || !event.title.trim()) issues.push(`${label}: mangler title`);
      if (typeof event.bankId !== "string" || !event.bankId.trim()) issues.push(`${label}: mangler bankId`);
      else if (ids.has(event.bankId)) issues.push(`${label}: duplisert bankId`);
      ids.add(event.bankId);
      for (const key of ["yearRange", "acceptedYearRange"]) {
        if (event[key] !== undefined) {
          const range = event[key];
          if (!range || !Number.isFinite(range.start) || !Number.isFinite(range.end) || range.start > range.end) {
            issues.push(`${label}: ugyldig ${key}`);
          }
        }
      }
    });
    return issues;
  },

  summarize(correct, wrong, mistakes) {
    const total = correct + wrong;
    const periods = new Map();
    mistakes.forEach(event => {
      const period = event.period || "Ukjent periode";
      periods.set(period, (periods.get(period) || 0) + 1);
    });
    return {
      total,
      percent: total ? Math.round(correct / total * 100) : null,
      periods: [...periods].sort((a, b) => b[1] - a[1])
    };
  },

  readSettings() {
    try {
      const value = JSON.parse(localStorage.getItem("tidslinjen.settings.v1"));
      return value && typeof value === "object" ? value : {};
    } catch { return {}; }
  },

  saveSettings(settings) {
    try { localStorage.setItem("tidslinjen.settings.v1", JSON.stringify(settings)); }
    catch { /* Playing also works when browser storage is unavailable. */ }
  }
};

const bankIssues = window.TimelineLearning.validateEvents(window.TIMELINE_EVENTS || []);
if (bankIssues.length) console.warn("Kontroll av hendelsesbanken:", bankIssues);
