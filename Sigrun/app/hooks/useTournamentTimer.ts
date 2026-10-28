/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { useEffect, useRef, useState } from 'react';
import type { EventsGetTimerStateResponse } from 'tsclients/proto/mimir.pb';
import { useApi } from './api';
import sound from '../../assets/snd/5min.wav';
import gong from '../../assets/snd/gong.mp3';
import gong2 from '../../assets/snd/gong2.mp3';

export function useTournamentTimer(eventId: string, eventTitle?: string) {
  const api = useApi();
  const endingSound = useRef<HTMLAudioElement | null>(null);
  const gongSound = useRef<HTMLAudioElement | null>(null);
  const [timerState, setTimerState] = useState<EventsGetTimerStateResponse | null>(null);
  const showSeating =
    !!timerState &&
    (timerState.timeRemaining > timerState.hideSeatingAfter || timerState.waitingForTimer);
  const timerWaiting = timerState?.waitingForTimer ?? false;

  useEffect(() => {
    const audio = new Audio(sound);
    endingSound.current = audio;
    return () => {
      audio.pause();
      endingSound.current = null;
    };
  }, []);

  const gongSource = eventTitle?.toLowerCase().includes('волк') ? gong2 : gong;
  useEffect(() => {
    const audio = new Audio(gongSource);
    gongSound.current = audio;
    return () => {
      audio.pause();
      gongSound.current = null;
    };
  }, [gongSource]);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let shouldUpdateFromServer = true;
    let current: EventsGetTimerStateResponse | null = null;
    let soundPlayed = false;
    let gongPlayed = false;
    setTimerState(null);
    const timer = setInterval(() => {
      if (inFlight) return;
      if (shouldUpdateFromServer) {
        inFlight = true;
        api
          .getTimerState(parseInt(eventId, 10))
          .then((state) => {
            if (cancelled) return;
            current = state;
            shouldUpdateFromServer = state.waitingForTimer;
            if (state.waitingForTimer) {
              soundPlayed = false;
              gongPlayed = false;
            }
            if (state.finished && !state.waitingForTimer && !soundPlayed && endingSound.current) {
              soundPlayed = true;
              void endingSound.current.play().catch(() => {});
            }
            if (state.started && !state.waitingForTimer && !gongPlayed && gongSound.current) {
              gongPlayed = true;
              void gongSound.current.play().catch(() => {});
            }
            setTimerState(state);
          })
          .catch(() => {
            // Retry transient failures on the next tick.
          })
          .finally(() => {
            inFlight = false;
          });
      } else if (current) {
        const previousTime = current.timeRemaining;
        current = { ...current, timeRemaining: previousTime - 1, finished: previousTime <= 1 };
        setTimerState(current);
        if (previousTime > 0 && previousTime % 60 === 0) shouldUpdateFromServer = true;
      }
    }, 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [api, eventId]);

  return { timerState, showSeating, timerWaiting };
}
