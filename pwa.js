(() => {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .catch(() => {
        // The game remains usable when offline caching is unavailable.
      });
  });
})();
