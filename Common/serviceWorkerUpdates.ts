// Keep long-running and resumed PWA tabs in sync with production deployments.
// registerType: 'autoUpdate' reloads clients once the new worker is activated.
export function watchServiceWorkerUpdates(registration: ServiceWorkerRegistration | undefined) {
  if (!registration) {
    return;
  }

  let checking = false;
  const check = async () => {
    if (checking || registration.installing || !navigator.onLine || document.hidden) {
      return;
    }

    checking = true;
    try {
      await registration.update();
    } catch {
      // Offline, unavailable server, or deployment in progress: retry next time.
    } finally {
      checking = false;
    }
  };

  void check();
  window.setInterval(() => void check(), 5 * 60 * 1000);
  window.addEventListener("online", () => void check());
  document.addEventListener("visibilitychange", () => void check());
}
