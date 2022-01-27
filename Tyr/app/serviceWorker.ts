import {environment} from "#config";
import {ClientToSwEvents, SwToClientEvents, validEventType} from "#/services/serviceWorkerConfig";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

self.addEventListener('install', function(event: Event) {
  // @ts-ignore
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', function(event: Event) {
  // @ts-ignore
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

/* eslint-disable no-undef */
if (workbox) {
  workbox.precaching.cleanupOutdatedCaches();

  // eslint-disable-next-line no-restricted-globals,no-underscore-dangle
  // @ts-ignore
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // java-script files cache
  workbox.routing.registerRoute(
    new RegExp('.+\\.js$'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'js-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 7,
          purgeOnQuotaError: true,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );

  // css files cache
  workbox.routing.registerRoute(
    new RegExp('.+\\.css$'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'css-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 5,
          maxAgeSeconds: 60 * 60 * 24 * 7,
          purgeOnQuotaError: true,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );

  // image files cache
  workbox.routing.registerRoute(
    new RegExp('.+\\.(png|jpg|jpeg|svg)$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 7,
          purgeOnQuotaError: true,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );

  workbox.routing.registerRoute(
    new RegExp('/.*'),
    new workbox.strategies.NetworkFirst({}),
    'GET',
  );

  let ws: WebSocket = new WebSocket(environment.ratatoskUrl);
  let currentLocale = 'en';
  ws.addEventListener('message', (message) => {
    try {
      const { t, ...data } = JSON.parse(message.data);
      if (validEventType(t)) {
        if (t === SwToClientEvents.NOTIFICATION) {
          if (Notification.permission === 'granted') {
            // @ts-ignore
            self.registration.showNotification('Pantheon', {
              body: data.localized_notification[currentLocale],
              vibrate: [500, 100, 500],
            });
          }
        } else {
          // @ts-ignore
          self.clients.matchAll(/* search options */).then((clients) => {
            // console.log('sw clients length', clients.length);
            if (clients && clients.length) {
              clients.forEach((client: any) => client.postMessage({type: t, data}));
            }
          });
        }
      }
    } catch (e) {}
  });
  self.onmessage = function(msg: MessageEvent) {
    switch (msg.data.type) {
      case ClientToSwEvents.REGISTER:
        ws.send(JSON.stringify({'t': ClientToSwEvents.REGISTER, 'd': {
          'game_hash': msg.data.sessionHashcode,
          'event_id': msg.data.eventId,
        }}));
        break;
      case ClientToSwEvents.SET_LOCALE:
        currentLocale = msg.data.locale;
        break;
    }
  }
} else {
  console.log(`[sw] Workbox failed to load`);
}


