import {environment} from "#config";
import {ClientToSwEvents, SwToClientEvents, validEventType} from "#/services/serviceWorkerConfig";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

/* eslint-disable no-undef */
if (workbox) {
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();
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
  ws.addEventListener('message', (message) => {
    try {
      const { t, ...data } = JSON.parse(message.data);
      if (validEventType(t)) {
        // @ts-ignore
        self.clients.matchAll(/* search options */).then( (clients) => {
          console.log('sw clients length', clients.length);
          if (clients && clients.length) {
            clients.forEach((client: any) => client.postMessage({type: t, data}));
          }
        });

      }
    } catch (e) {}
  });
  self.onmessage = function(msg: MessageEvent) {
    switch (msg.data.type) {
      case ClientToSwEvents.REGISTER:
        ws.send(JSON.stringify({'t': ClientToSwEvents.REGISTER, 'd': { 'game_hash': msg.data.sessionHashcode }}));
        break;
    }
  }
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}


