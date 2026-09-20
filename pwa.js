(() => {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const installButton = document.getElementById('installAppBtn');
  const installMessage = document.getElementById('installAppMessage');
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
  });

  installButton?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt = null;
      return;
    }
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      installMessage.textContent = 'Trykk Del i Safari og velg «Legg til på Hjem-skjerm».';
    } else {
      installMessage.textContent = 'Åpne nettlesermenyen og velg «Installer app» eller «Legg til på Hjem-skjerm».';
    }
  });

  window.addEventListener('appinstalled', () => {
    installMessage.textContent = 'Tidslinjen er lagt til på enheten.';
  });

  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const oldRegistrations = registrations.filter(registration =>
      registration.active?.scriptURL.includes('/service-worker.js') &&
      !registration.active.scriptURL.includes('v=4')
    );
    if (oldRegistrations.length && !sessionStorage.getItem('tidslinjen-cache-reset')) {
      sessionStorage.setItem('tidslinjen-cache-reset', '1');
      await Promise.all(oldRegistrations.map(registration => registration.unregister()));
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      location.reload();
      return;
    }
    navigator.serviceWorker.register('./service-worker.js?v=11', { scope: './' })
      .catch(() => {
        // The game remains usable when offline caching is unavailable.
      });
  });
})();
