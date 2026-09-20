/* Illustrated scene transitions, plus a still rustic background. */
(() => {
  const scene = document.querySelector('.scene');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const themes = {
    rustic: ['rustic', '50% 50%', 'Ro til å utforske', '#c3ab80'],
    underground: ['earth', '50% 75%', 'Djup tid', '#b48a53'],
    shallow: ['earth', '50% 15%', 'Mot lyset', '#c5a16d'],
    surface: ['land', '50% 78%', 'Landskapet åpner seg', '#9fba91'],
    treetops: ['land', '50% 36%', 'Over skogen', '#b6c5a6'],
    clouds: ['land', '50% 0%', 'Gjennom skylaget', '#d3d3bd'],
    highsky: ['space', '50% 100%', 'Jorda under oss', '#9db9cd'],
    atmosphere: ['space', '50% 65%', 'Ved verdensrommets kant', '#93aac5'],
    space: ['space', '50% 15%', 'Det store ukjente', '#c2b1d0']
  };
  evolutionStages.forEach((stage, index) => {
    const asset = index < 5 ? 'ocean' : index < 18 ? 'land' : index < 21 ? 'civilization' : 'space';
    themes[stage.key] = [asset, `50% ${Math.round(85 - (index % 5) * 16)}%`,
      index < 5 ? 'Livet i havet' : index < 18 ? 'Livet erobrer land' : index < 21 ? 'Menneskets spor' : 'Nye horisonter',
      index < 5 ? '#83bbb5' : index < 18 ? '#b3bb8b' : '#c5a46c'];
  });

  const hero = document.createElement('section');
  hero.className = 'journey-hero';
  hero.setAttribute('aria-label', 'Bakgrunnsreisen');
  hero.innerHTML = '<div class="journey-eyebrow">EN REISE GJENNOM TIDEN</div><div class="journey-chapter"></div>';
  hero.appendChild(document.querySelector('.topline'));
  document.querySelector('main').prepend(hero);
  const controls = document.createElement('div');
  controls.className = 'journey-preview-controls';
  controls.innerHTML = '<span>Forhåndsvis miljøene</span><button type="button" aria-label="Forrige bakgrunn">←</button><output></output><button type="button" aria-label="Neste bakgrunn">→</button>';
  if (document.body.classList.contains('design-preview')) hero.appendChild(controls);
  const list = () => backgroundTheme === 'rustic' ? [rusticStage] : backgroundTheme === 'evolution' ? evolutionStages : stages;
  const preview = delta => {
    const collection = list();
    const index = collection.findIndex(stage => stage.key === document.body.dataset.stage);
    const next = (index + delta + collection.length) % collection.length;
    const stage = collection[next];
    document.body.dataset.stage = stage.key;
    document.getElementById('stageName').textContent = stage.name;
    document.getElementById('stageDesc').textContent = stage.desc;
    document.getElementById('stageProgress').style.width = `${next / (collection.length - 1) * 100}%`;
  };
  controls.querySelectorAll('button')[0].onclick = () => preview(-1);
  controls.querySelectorAll('button')[1].onclick = () => preview(1);

  let activeKey;
  let generation = 0;
  const cache = new Map();
  function load(asset) {
    if (!cache.has(asset)) {
      const image = new Image();
      image.src = `./assets/journey/${asset}.png`;
      cache.set(asset, image.decode().then(() => image.src).catch(() => null));
    }
    return cache.get(asset);
  }
  async function changeScene() {
    const key = document.body.dataset.stage;
    if (key === activeKey) return;
    activeKey = key;
    const token = ++generation;
    const [asset, position, chapter, accent] = themes[key] || themes.underground;
    hero.querySelector('.journey-chapter').textContent = chapter;
    controls.hidden = key === 'rustic';
    const collection = list();
    const index = collection.findIndex(stage => stage.key === key);
    controls.querySelector('output').textContent = `${index + 1} / ${collection.length}`;
    document.body.style.setProperty('--journey-accent', accent);
    const url = await load(asset);
    if (token !== generation || !url) return;
    const layer = document.createElement('div');
    layer.className = 'journey-layer';
    layer.dataset.environment = asset;
    layer.style.backgroundImage = `url("${url}")`;
    layer.style.backgroundPosition = position;
    const oldLayers = [...scene.querySelectorAll('.journey-layer')];
    scene.appendChild(layer);
    // Cap layers when navigation is rapid. Only decoded images are displayed.
    oldLayers.slice(0, -1).forEach(old => old.remove());
    const duration = key === 'rustic' || reducedMotion.matches || !oldLayers.length ? 0 : 1500;
    const animation = layer.animate([
      { opacity: 0, transform: 'scale(1.045) translateY(8px)' },
      { opacity: 1, transform: 'scale(1) translateY(0)' }
    ], { duration, easing: 'cubic-bezier(.2,.6,.2,1)', fill: 'both' });
    animation.finished.then(() => {
      oldLayers.forEach(old => old.remove());
      animation.cancel();
    }).catch(() => {});
    if (key !== 'rustic' && !reducedMotion.matches) {
      const title = document.getElementById('stageName');
      title.getAnimations().forEach(animation => animation.cancel());
      title.animate([{ opacity: .35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'ease-out' });
    }
    const next = collection[(index + 1) % collection.length];
    if (next) load(themes[next.key][0]);
  }
  new MutationObserver(changeScene).observe(document.body, { attributes: true, attributeFilter: ['data-stage'] });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) scene.getAnimations({ subtree: true }).forEach(animation => animation.finish());
  });
  changeScene();
})();
