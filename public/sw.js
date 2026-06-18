// Service Worker mínimo — habilita instalação como PWA
// Estratégia network-first: sempre busca da rede (app em tempo real)
const CACHE_NAME = 'lashhub-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
