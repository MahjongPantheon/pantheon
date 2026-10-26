import { useRef, type MouseEvent, type PointerEvent } from 'react';

// Require a deliberate horizontal swipe, leaving vertical gestures to native scrolling.
export function useSwipeToClose(close: () => void) {
  const gesture = useRef<{
    pointerId: number;
    x: number;
    y: number;
    horizontal: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      gesture.current = null;
      suppressClick.current = false;
      if (!event.isPrimary || event.button !== 0) {
        return;
      }
      if (!(event.target as Element).closest('[role="dialog"]')) {
        return;
      }
      gesture.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        horizontal: false,
      };
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const start = gesture.current;
      if (!start || start.pointerId !== event.pointerId) {
        return;
      }
      const x = Math.abs(event.clientX - start.x);
      const y = Math.abs(event.clientY - start.y);
      if (!start.horizontal && Math.max(x, y) >= 10) {
        if (x <= y * 1.5) {
          gesture.current = null;
          return;
        }
        start.horizontal = true;
        suppressClick.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
      if (start.horizontal) {
        event.preventDefault();
      }
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      const start = gesture.current;
      gesture.current = null;
      if (!start || start.pointerId !== event.pointerId) {
        return;
      }
      const x = start.x - event.clientX;
      const y = Math.abs(event.clientY - start.y);
      if (x >= 64 && x > y * 1.5) {
        suppressClick.current = true;
        close();
      }
    },
    onPointerCancel() {
      gesture.current = null;
      suppressClick.current = false;
    },
    onClickCapture(event: MouseEvent<HTMLDivElement>) {
      if (suppressClick.current && event.detail > 0) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }
    },
  };
}
