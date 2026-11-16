import { useEffect } from 'react';
import { useLocationProperty } from 'wouter/use-browser-location';

const currentUrl = () => window.location.pathname + window.location.search + window.location.hash;
const serverUrl = () => '';
const inputEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

function followAnchor() {
  let id: string;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return () => {};
  }
  if (!id) return () => {};

  let active = true;
  let frame: number | undefined;
  const schedule = () => {
    if (!active || frame !== undefined) return;
    frame = window.requestAnimationFrame(() => {
      frame = undefined;
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  };
  const mutations = new MutationObserver(schedule);
  const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
  const stop = () => {
    active = false;
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    mutations.disconnect();
    resize?.disconnect();
    document.removeEventListener('load', schedule, true);
    for (const event of inputEvents) window.removeEventListener(event, stop);
  };

  // The section may mount after navigation; fonts and images can move it afterwards.
  mutations.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id'],
  });
  resize?.observe(document.body);
  document.addEventListener('load', schedule, true);
  void document.fonts?.ready.then(schedule);
  for (const event of inputEvents) window.addEventListener(event, stop, { passive: true });
  schedule();
  return stop;
}

export function useAnchorScroll() {
  // Wouter also reports pushState/replaceState, which do not emit native hashchange events.
  const url = useLocationProperty(currentUrl, serverUrl);
  useEffect(() => {
    let stop = followAnchor();
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.download || link.target) return;
      const destination = new URL(link.href);
      if (!destination.hash || destination.href !== window.location.href) return;

      // Selecting the same anchor again changes no URL, so restart explicitly.
      stop();
      stop = followAnchor();
    };
    document.addEventListener('click', onClick);
    return () => {
      stop();
      document.removeEventListener('click', onClick);
    };
  }, [url]);
}
