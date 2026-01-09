/* Service worker for offline caching with weather data support */
const CACHE_NAME = 'weather-app-cache-v2';
const WEATHER_CACHE_NAME = 'weather-data-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/src/assets/favicon.ico'
];

// Cache weather API URLs
const isWeatherAPI = (url) => {
  return url.includes('api.open-meteo.com') || url.includes('geocoding-api.open-meteo.com');
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
      caches.open(WEATHER_CACHE_NAME)
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== WEATHER_CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      ),
      // Clean up expired weather cache entries
      caches.open(WEATHER_CACHE_NAME).then((cache) => {
        return cache.keys().then((keys) => {
          return Promise.all(keys.map(async (request) => {
            const response = await cache.match(request);
            if (response) {
              const expiresAt = response.headers.get('X-Cache-Expires-At');
              if (expiresAt && Date.now() >= parseInt(expiresAt)) {
                return cache.delete(request);
              }
            }
          }));
        });
      })
    ]).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle weather API requests with network-first strategy and cache fallback
  if (isWeatherAPI(url.href)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const copy = response.clone();
            caches.open(WEATHER_CACHE_NAME).then((cache) => {
              // Store with timestamp header for expiration (24 hours)
              const cacheKey = new Request(request.url, request);
              // Add custom timestamp header to response for expiration tracking
              const headers = new Headers(copy.headers);
              headers.set('X-Cached-At', Date.now().toString());
              headers.set('X-Cache-Expires-At', (Date.now() + 24 * 60 * 60 * 1000).toString());
              const cachedResponse = new Response(copy.body, {
                status: copy.status,
                statusText: copy.statusText,
                headers: headers
              });
              cache.put(cacheKey, cachedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails (with expiration check)
          return caches.match(request).then((cached) => {
            if (cached) {
              // Check if cache is expired (24 hours)
              const cachedAt = cached.headers.get('X-Cached-At');
              const expiresAt = cached.headers.get('X-Cache-Expires-At');
              if (expiresAt && Date.now() < parseInt(expiresAt)) {
                return cached;
              } else if (cachedAt && Date.now() - parseInt(cachedAt) < 24 * 60 * 60 * 1000) {
                // Fallback check using cached timestamp
                return cached;
              }
              // Cache expired, try to clean it up
              caches.open(WEATHER_CACHE_NAME).then((cache) => cache.delete(request));
            }
            // Return a basic error response if no cache available
            return new Response(
              JSON.stringify({ error: 'Offline: No cached data available' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle app assets: network-first for HTML, cache-first for others
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/index.html')))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached || new Response('Offline', { status: 503 }))
      )
    );
  }
});
