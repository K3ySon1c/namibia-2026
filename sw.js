/* =============================================================================
   sw.js — Service Worker der Namibia-Reise-PWA

   Strategie: beim install ALLES in einen versionierten Cache legen,
   danach cache-first. Nach dem ersten Laden findet kein Netzwerkaufruf
   mehr statt.

   WICHTIG: Nach jeder inhaltlichen Änderung (z. B. in data.js) die
   Cache-Version hier erhöhen — namibia-v1 → namibia-v2 → …
   Sonst behalten die Geräte den alten Stand.
   ========================================================================== */

const CACHE = 'namibia-v1';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './app.js',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png'
];

/* --- Installation: alles vorab in den Cache ---------------------------- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* --- Aktivierung: alte Caches entfernen -------------------------------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* --- Anfragen: cache-first, Netz nur als Fallback ---------------------- */
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // geo:, mailto:, tel:, Maps

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;

      return fetch(req).then(res => {
        // Erfolgreiche eigene Antworten mit aufnehmen
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Offline und nichts im Cache: für Seitenaufrufe die App-Hülle liefern
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});

/* --- Auf Wunsch der App sofort übernehmen ------------------------------ */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
