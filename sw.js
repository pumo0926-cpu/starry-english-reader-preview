const CACHE = 'starry-reader-v3'
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '')
const scoped = (path) => `${BASE}${path}`
const APP_SHELL = [scoped('/'), scoped('/manifest.webmanifest'), scoped('/assets/demo-cover.webp'), scoped('/assets/demo-illustration.webp'), scoped('/assets/demo-chapter.mp3'), scoped('/books/arthur-meets-the-president/pages/page-01.webp')]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))))
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (event.request.headers.has('range')) {
    event.respondWith(fetch(event.request))
    return
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && response.status === 200) {
      const copy = response.clone()
      caches.open(CACHE).then((cache) => cache.put(event.request, copy))
    }
    return response
  }).catch(() => caches.match(scoped('/')))))
})
