import { registerSW } from 'virtual:pwa-register';
import { watchServiceWorkerUpdates } from '../../Common/serviceWorkerUpdates';

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    watchServiceWorkerUpdates(registration);
  },
});
