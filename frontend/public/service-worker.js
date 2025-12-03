/* eslint-disable no-restricted-globals */

// Minimal service worker za PWA
self.addEventListener('install', event => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', event => {
  // Ovo samo propušta sve requeste bez cache logike
  event.respondWith(fetch(event.request));
});
