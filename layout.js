// Keep the playing area in view; secondary content remains available on demand.
(() => {
  const board = document.querySelector('.board');
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
