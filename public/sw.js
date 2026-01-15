// Service Worker para PWA - Club 738
const CACHE_NAME = 'club-738-v1.19.0';
const RUNTIME_CACHE = 'club-738-runtime';

// Assets críticos para funcionamiento offline
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/logo-club-738.jpg',
  '/manifest.json'
];

// Instalación: precachear assets críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: estrategia Network-First con fallback a cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar Firebase requests (siempre network)
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') ||
      url.hostname.includes('firebaseio')) {
    return;
  }

  event.respondWith(
    // Network-First strategy
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback a cache si network falla
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Fallback a página offline si existe
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // Si nada está en cache, retornar error
          return new Response('Sin conexión a internet', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Sincronización en background (cuando recupera conexión)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-documents') {
    event.waitUntil(
      // Aquí se podrían sincronizar documentos pendientes
      Promise.resolve()
    );
  }
});

// Notificaciones push (futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación del Club 738',
    icon: '/assets/logo-club-738.jpg',
    badge: '/assets/logo-club-738.jpg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/assets/logo-club-738.jpg'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/logo-club-738.jpg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Club 738', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
