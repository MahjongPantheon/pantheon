import * as React from 'react';
import { LastRoundPart } from '../helpers/lastRound';

export function LastRoundText({ parts }: { parts: LastRoundPart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.playerId !== undefined ? <strong key={index}>{part.text}</strong> : part.text
      )}
    </>
  );
}
