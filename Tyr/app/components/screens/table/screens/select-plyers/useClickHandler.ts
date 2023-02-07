import { useCallback } from 'react';

type ClickHandler = (id: number) => void;

export function useClickHandler(
  ids: readonly [number, number, number, number],
  onClick: ClickHandler
) {
  return [
    useCallback(() => {
      onClick(ids[0]);
    }, [ids[0]]),
    useCallback(() => {
      onClick(ids[1]);
    }, [ids[1]]),
    useCallback(() => {
      onClick(ids[2]);
    }, [ids[2]]),
    useCallback(() => {
      onClick(ids[3]);
    }, [ids[3]]),
  ];
}
