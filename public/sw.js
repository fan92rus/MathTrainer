/// <reference lib="webworker" />

const CACHE_NAME = 'mathtrainer-v1';
const PRECACHE_URLS = [
  '/MathTrainer/',
  '/MathTrainer/index.html',
];

// Установка — предварительный кэш shell-файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Активация — удалить старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network-first для HTML, cache-first для статики
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Только GET-запросы
  if (request.method !== 'GET') return;

  // Для навигации (HTML) — network first
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/MathTrainer/index.html')))
    );
    return;
  }

  // Для статики (JS, CSS, images) — cache first, затем network
  if (
    url.pathname.startsWith('/MathTrainer/assets/') ||
    url.pathname.match(/\.(js|css|svg|png|jpg|webp|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }
});
