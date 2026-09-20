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
  const setup = document.createElement('details');
  setup.className = 'game-settings';
  setup.innerHTML = '<summary>Innstillinger og toppliste</summary><div class="settings-content"></div>';
  const panel = setup.lastElementChild;
  const quick = document.getElementById('quickStartBtn');
  const help = quick.nextElementSibling;
  board.prepend(setup);
  const rankings = document.createElement('details');
  rankings.id = 'leaderboardToggle';
  rankings.innerHTML = '<summary>Vis topplisten</summary>';
  rankings.append(document.querySelector('.leaderboard'));
  panel.append(quick, help, document.querySelector('.toolbar'), rankings);
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
