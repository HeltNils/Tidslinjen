export function compareDuelCards(first, second) {
  if (first.year !== second.year) return first.year < second.year ? -1 : 1;
  if (first.timelineDate && second.timelineDate) {
    return first.timelineDate < second.timelineDate ? -1 : first.timelineDate > second.timelineDate ? 1 : 0;
  }
  return 0;
}

export function isValidDuelPlacement(timeline, event, position) {
  if (!Number.isInteger(position) || position < 0 || position > timeline.length) return false;
  return timeline.slice(0, position).every(card => compareDuelCards(card, event) <= 0) &&
    timeline.slice(position).every(card => compareDuelCards(event, card) <= 0);
}

export function scoreDuelPlacement(event, neighbors = []) {
  const base = [1, 2, 3].includes(Number(event.difficulty)) ? Number(event.difficulty) * 100 : 0;
  const distances = neighbors.filter(card => card && Number.isFinite(card.year))
    .map(card => Math.abs(event.year - card.year));
  const distance = distances.length ? Math.min(...distances) : Infinity;
  const rate = distance <= 10 ? 1 : distance <= 50 ? 0.5 : distance <= 100 ? 0.25 : 0;
  const bonus = Math.round(base * rate);
  return { base, bonus, total: base + bonus, distance };
}

export function calculateEloChanges(ratingOne, ratingTwo, resultOne, kFactor = 32) {
  if (![ratingOne, ratingTwo].every(Number.isFinite) ||
      !Number.isFinite(resultOne) || resultOne < 0 || resultOne > 1 ||
      !Number.isFinite(kFactor) || kFactor <= 0) {
    throw new RangeError('Ugyldige verdier for Elo-beregning.');
  }
  const expectedOne = 1 / (1 + 10 ** ((ratingTwo - ratingOne) / 400));
  const changeOne = Math.round(kFactor * (resultOne - expectedOne));
  return { one: changeOne, two: changeOne === 0 ? 0 : -changeOne };
}
