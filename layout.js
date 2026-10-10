// Keep the playing area in view; secondary content remains available on demand.
(() => {
  const board = document.querySelector('.board');
  const transparencyKey = 'tidslinjen.translucentBoard';
  const transparency = document.createElement('button');
  transparency.id = 'translucentBoardSwitch';
  transparency.type = 'button';
  transparency.className = 'secondary surface-switch';
  transparency.setAttribute('role', 'switch');
  transparency.setAttribute('aria-label', 'Gjennomskinnelig spillflate');
  transparency.innerHTML = '<span class="switch-track" aria-hidden="true"></span><span>Gjennomskinnelig flate</span><span class="switch-state" aria-hidden="true">Av</span>';
  const setTransparency = enabled => {
    document.body.classList.toggle('translucent-board', enabled);
    transparency.setAttribute('aria-checked', String(enabled));
    transparency.querySelector('.switch-state').textContent = enabled ? 'På' : 'Av';
  };
  let savedTransparency = false;
  try { savedTransparency = localStorage.getItem(transparencyKey) === 'true'; } catch {}
  setTransparency(savedTransparency);
  transparency.addEventListener('click', () => {
    const enabled = transparency.getAttribute('aria-checked') !== 'true';
    setTransparency(enabled);
    try { localStorage.setItem(transparencyKey, String(enabled)); } catch {}
  });
  document.querySelector('.actions').append(transparency);
  const topbar = document.createElement('div');
  topbar.className = 'board-topbar';
  const setup = document.createElement('details');
  setup.className = 'game-settings';
  setup.innerHTML = '<summary>Innstillinger, trofeer og toppliste</summary><div class="settings-content"></div>';
  const panel = setup.lastElementChild;
  const quick = document.getElementById('quickStartBtn');
  const help = quick.nextElementSibling;
  const trophyRoomButton = document.createElement('button');
  trophyRoomButton.id = 'trophyRoomBtn';
  trophyRoomButton.type = 'button';
  trophyRoomButton.className = 'secondary trophy-room-button';
  trophyRoomButton.textContent = 'Trofeerom';
  const trophyRoom = document.createElement('dialog');
  trophyRoom.id = 'trophyRoom';
  trophyRoom.className = 'trophy-room';
  trophyRoom.setAttribute('aria-labelledby', 'trophyRoomTitle');
  trophyRoom.innerHTML = '<div class="trophy-room-content"><header class="trophy-room-header"><div><p class="trophy-room-kicker">TIDSLINJEN</p><h2 id="trophyRoomTitle">Trofeerom</h2><p class="trophy-room-intro">Se alle trofeene dine og hva som gjenstår å låse opp.</p></div><button id="trophyRoomBack" type="button" class="secondary">Tilbake til hovedsiden</button></header><p class="trophy-room-account" id="trophyRoomAccount"></p><div id="trophyRoomList" class="trophy-room-grid"></div></div>';
  board.prepend(topbar);
  topbar.append(setup, trophyRoomButton);
  document.body.append(trophyRoom);
  trophyRoomButton.addEventListener('click', () => {
    const signedIn = TimelineAchievements.renderTrophyRoom(document.getElementById('trophyRoomList'));
    document.getElementById('trophyRoomAccount').textContent = signedIn
      ? 'Trofeene er lagret på kontoen din.'
      : 'Du spiller som gjest. Logg inn for å opptjene og lagre trofeer.';
    trophyRoom.showModal();
  });
  const closeTrophyRoom = () => {
    trophyRoom.close();
    trophyRoomButton.focus();
  };
  document.getElementById('trophyRoomBack').addEventListener('click', closeTrophyRoom);
  trophyRoom.addEventListener('click', event => {
    if (event.target === trophyRoom) closeTrophyRoom();
  });
  const rankings = document.createElement('details');
  rankings.id = 'leaderboardToggle';
  rankings.innerHTML = '<summary>Vis topplisten</summary>';
  rankings.append(document.querySelector('.leaderboard'));
  const trophies = document.createElement('details');
  trophies.id = 'achievementsToggle';
  trophies.innerHTML = '<summary>Vis trofeer</summary>';
  trophies.append(document.querySelector('.achievements'));
  panel.append(quick, help, document.querySelector('.toolbar'), trophies, rankings);
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'secondary'; close.textContent = 'Ferdig – tilbake til spillet';
  close.onclick = () => { setup.open = false; setup.firstElementChild.focus(); };
  panel.prepend(close);
  const collapse = () => { if (roundActive) setup.open = false; };
  document.getElementById('quickStartBtn').addEventListener('click', collapse);
  document.getElementById('startBtn').addEventListener('click', () => {
    setup.open = !roundActive;
  });
  window.TimelineLayout = { started: () => { setup.open = false; } };
  for (const [id, label, hide] of [
    ['roundSummary', 'Lukk resultat', element => element.classList.add('hidden')],
    ['rules', 'Lukk regler', element => element.classList.remove('show')]
  ]) {
    const element = document.getElementById(id);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'secondary panel-close'; button.textContent = label;
    button.onclick = () => { hide(element); document.getElementById(id === 'rules' ? 'rulesBtn' : 'startBtn').focus(); };
    element.prepend(button);
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && setup.open) { setup.open = false; setup.firstElementChild.focus(); }
  });
})();
