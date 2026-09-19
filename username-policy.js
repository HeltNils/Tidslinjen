// Shared by the browser and the local account server.
(() => {
  const blockedTerms = Object.freeze([
    'rasisme', 'rasist', 'homofobi', 'homofob', 'transfobi', 'transfob',
    'nazist', 'hitler', 'terrorist', 'terror', 'fuck', 'fucking', 'jævla', 'hore',
    'charlie', 'kirk', 'jefferey', 'epstein', 'george', 'floyd',
    'stalin', 'mussolini', 'binladen', 'nazi', 'nigger', 'nigga', 'porno',
    'neger', 'faggot', 'fagget', 'faggit', 'tranny', 'retard',
    'fitte', 'cunt', 'motherfucker', 'drittsekk'
  ]);
  const keyFor = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  const isBlocked = value => blockedTerms.some(term => keyFor(String(value)).includes(keyFor(term)));
  const errorFor = (value, registering = true) => {
    const pattern = registering ? /^\p{Lu}\p{L}{2,23}$/u : /^\p{L}{3,24}$/u;
    if (!pattern.test(value)) return registering
      ? 'Bruk 3–24 bokstaver med stor forbokstav, uten mellomrom eller symboler.'
      : 'Brukernavnet må inneholde 3–24 bokstaver.';
    return isBlocked(value) ? 'Dette brukernavnet er ikke tillatt. Velg et annet navn.' : '';
  };
  globalThis.UsernamePolicy = Object.freeze({ blockedTerms, keyFor, isBlocked, errorFor });
})();
