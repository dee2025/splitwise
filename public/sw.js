const CACHE_VERSION = "moneysplit-pwa-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/logo.svg",
  "/logo.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
];

const SENSITIVE_PREFIXES = [
  "/api",
  "/admin",
  "/dashboard",
  "/home",
  "/groups",
  "/expenses",
  "/notifications",
  "/profile",
  "/account",
  "/panel",
  "/login",
  "/signup",
];

const SAFE_STATIC_PREFIXES = [
  "/_next/static/",
  "/icons/",
  "/images/",
];

const SAFE_STATIC_FILES = new Set([
  "/logo.svg",
  "/logo.png",
  "/favicon.ico",
  "/dashboard.png",
  "/robots.txt",
]);

function isSensitiveUrl(url) {
  const pathname = url.pathname.toLowerCase();
  return SENSITIVE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isSafeStaticUrl(url) {
  if (url.origin !== self.location.origin) return false;
  if (isSensitiveUrl(url)) return false;

  return (
    SAFE_STATIC_FILES.has(url.pathname) ||
    SAFE_STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  );
}

function canCacheResponse(response) {
  if (!response || !response.ok) return false;
  if (response.type !== "basic") return false;
  if (response.headers.has("set-cookie")) return false;

  const cacheControl = response.headers.get("cache-control") || "";
  if (/private|no-store|no-cache/i.test(cacheControl)) return false;

  const contentType = response.headers.get("content-type") || "";
  return /image|font|javascript|css|svg|json|text\/plain/i.test(contentType);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isSensitiveUrl(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (!isSafeStaticUrl(url)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          if (canCacheResponse(response)) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkResponse;
    }),
  );
});
