const CACHE = 'ke-pollon-v4';
const FILES = [
  './',
  './index.html',
  './logo.jpg',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Instalar — guardar archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting()) // activar inmediatamente
  );
});

// Activar — borrar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // tomar control de todas las pestañas
  );
});

// Fetch — red primero, caché de respaldo
self.addEventListener('fetch', e => {
  // Solo manejar requests del mismo origen
  if(!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar copia fresca en caché
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) // sin internet → usar caché
  );
});

// Mensaje para forzar actualización desde la app
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
