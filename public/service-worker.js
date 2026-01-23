/* eslint-disable no-restricted-globals */

const CACHE_NAME = "accounting-app-v2";
const urlsToCache = ["/", "/index.html"];

// Встановлення Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Активація Service Worker і очистка старих кешів
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Перехоплення запитів
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Для CSS та JS файлів - спочатку мережа, потім кеш
  if (
    url.pathname.includes("/static/css/") ||
    url.pathname.includes("/static/js/")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Клонуємо відповідь для кешування
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Якщо мережа недоступна, повертаємо з кешу
          return caches.match(request);
        }),
    );
    return;
  }

  // Для інших ресурсів - спочатку кеш, потім мережа
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    }),
  );
});
