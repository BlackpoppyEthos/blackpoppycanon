// Black Poppy Canon — entry point
import { initApp } from './app.js';
import { initTheme } from './theme.js';

initTheme();
initApp(document.getElementById('app'));

// Register the service worker for offline / PWA support.
// Only in production-like contexts (https or localhost).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* Offline support is progressive enhancement — never block the app. */
    });
  });
}
