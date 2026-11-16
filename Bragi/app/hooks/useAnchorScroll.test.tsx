import { act, cleanup, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnchorScroll } from './useAnchorScroll';

let nextFrame = 0;
let frames: Map<number, FrameRequestCallback>;
let resizeCallbacks: Array<() => void>;
const fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');

beforeEach(() => {
  window.history.replaceState(null, '', '/en/forHosts');
  frames = new Map();
  resizeCallbacks = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
  );
});

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  if (fontsDescriptor) {
    Object.defineProperty(document, 'fonts', fontsDescriptor);
  } else {
    Reflect.deleteProperty(document, 'fonts');
  }
  vi.unstubAllGlobals();
});

async function flushFrames() {
  await act(async () => {
    await Promise.resolve();
    while (frames.size) {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(0);
    }
  });
}

function addSection(id: string) {
  const section = document.createElement('h3');
  section.id = id;
  section.scrollIntoView = vi.fn();
  document.body.append(section);
  return section;
}

describe('anchor scrolling', () => {
  it('waits for a section that mounts after the initial anchor navigation', async () => {
    window.history.replaceState(null, '', '/en/forHosts#tournament');
    renderHook(() => useAnchorScroll());
    await flushFrames();

    const section = addSection('tournament');
    await flushFrames();

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
  });

  it('realigns the anchor after an image or layout change', async () => {
    window.history.replaceState(null, '', '/en/forHosts#club');
    const section = addSection('club');
    renderHook(() => useAnchorScroll());
    await flushFrames();
    vi.mocked(section.scrollIntoView).mockClear();

    const image = document.createElement('img');
    document.body.prepend(image);
    fireEvent.load(image);
    await flushFrames();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);

    resizeCallbacks[0]();
    await flushFrames();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it('realigns after fonts finish loading', async () => {
    let finishFonts: () => void = () => {};
    const ready = new Promise<void>((resolve) => {
      finishFonts = resolve;
    });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready } });
    window.history.replaceState(null, '', '/en/forHosts#club');
    const section = addSection('club');
    renderHook(() => useAnchorScroll());
    await flushFrames();
    vi.mocked(section.scrollIntoView).mockClear();

    finishFonts();
    await flushFrames();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it.each(['pushState', 'replaceState'] as const)(
    'follows an anchor selected through client-side %s navigation',
    async (method) => {
      const section = addSection('predefined');
      renderHook(() => useAnchorScroll());

      act(() => window.history[method](null, '', '/ru/forHosts#predefined'));
      await flushFrames();
      expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
    }
  );

  it('handles native hash changes and percent-encoded section IDs', async () => {
    const section = addSection('рассадка');
    renderHook(() => useAnchorScroll());

    act(() => {
      window.history.replaceState(null, '', `/ru/forHosts#${encodeURIComponent(section.id)}`);
      fireEvent(window, new Event('hashchange'));
    });
    await flushFrames();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it.each(['wheel', 'touchstart', 'pointerdown', 'keydown'])(
    'stops automatic realignment after %s input',
    async (event) => {
      window.history.replaceState(null, '', '/en/forHosts#club');
      const section = addSection('club');
      renderHook(() => useAnchorScroll());
      await flushFrames();
      vi.mocked(section.scrollIntoView).mockClear();

      fireEvent(window, new Event(event));
      resizeCallbacks[0]();
      document.body.append(document.createElement('p'));
      await flushFrames();
      expect(section.scrollIntoView).not.toHaveBeenCalled();
    }
  );

  it('allows selecting the same anchor again after manually scrolling away', async () => {
    window.history.replaceState(null, '', '/en/forHosts#club');
    const section = addSection('club');
    const link = document.createElement('a');
    link.href = '#club';
    link.addEventListener('click', (event) => event.preventDefault());
    document.body.append(link);
    renderHook(() => useAnchorScroll());
    await flushFrames();
    vi.mocked(section.scrollIntoView).mockClear();

    fireEvent.wheel(window);
    fireEvent.click(link);
    await flushFrames();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('cancels pending scrolling and observers on unmount', async () => {
    window.history.replaceState(null, '', '/en/forHosts#club');
    const section = addSection('club');
    const { unmount } = renderHook(() => useAnchorScroll());
    unmount();

    resizeCallbacks[0]();
    await flushFrames();
    expect(section.scrollIntoView).not.toHaveBeenCalled();
  });

  it.each(['', '#%E0%A4%A'])('ignores an empty or malformed fragment: %s', async (hash) => {
    window.history.replaceState(null, '', `/en/forHosts${hash}`);
    const section = addSection('club');
    renderHook(() => useAnchorScroll());
    await flushFrames();
    expect(section.scrollIntoView).not.toHaveBeenCalled();
    expect(resizeCallbacks).toHaveLength(0);
  });
});
