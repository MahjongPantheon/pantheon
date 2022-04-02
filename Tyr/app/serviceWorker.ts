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

  let reconnectTimeout = [1, 1]; // secs
  function createReconnectingSocket(onCreated: (ws: WebSocket) => void) {
    let ws: WebSocket = new WebSocket(environment.ratatoskUrl);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        // fibonacci increment
        let sum = reconnectTimeout[0] + reconnectTimeout[1];
        reconnectTimeout[0] = reconnectTimeout[1];
        reconnectTimeout[1] = sum;
        if (reconnectTimeout[0] > 30) {
          reconnectTimeout[0] = 30;
        }
        createReconnectingSocket(onCreated);
      }, reconnectTimeout[0] * 1000);
    });
    ws.addEventListener('open', () => {
      reconnectTimeout = [1, 1];
      onCreated(ws);
    });
  }

  let currentLocale = 'en';
  let socket: WebSocket;
  reconnect(() => {}); // first time
  function reconnect(onReady: () => void) {
    createReconnectingSocket((ws) => {
      // @ts-ignore
      self.clients.matchAll(/* search options */).then((clients) => {
        // console.log('sw clients length', clients.length);
        if (clients && clients.length) {
          clients.forEach((client: any) => client.postMessage({type: SwToClientEvents.RECONNECTED}));
        }
      });

      socket = ws;
      ws.addEventListener('message', (message) => {
        try {
          const {t, ...data} = JSON.parse(message.data);
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
        } catch (e) {
        }
      });
      onReady();
    });
  }

  self.onmessage = function(msg: MessageEvent) {
    function regClient() {
      socket.send(JSON.stringify({'t': ClientToSwEvents.REGISTER, 'd': {
        'game_hash': msg.data.sessionHashcode,
        'event_id': msg.data.eventId,
      }}));
    }

    switch (msg.data.type) {
      case ClientToSwEvents.REGISTER:
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          reconnect(() => regClient());
          return;
        } else {
          regClient();
        }

        break;
      case ClientToSwEvents.SET_LOCALE:
        currentLocale = msg.data.locale;
        break;
    }
  }
} else {
  console.log(`[sw] Workbox failed to load`);
}


