import * as React from 'react';
import { Anchor } from '@mantine/core';

/** Old cached achievements and event totals have no game references. */
export const AchievementPlayer: React.FC<{
  eventId: string;
  title: string;
  sessionHashes?: string[];
  gameLabel: string;
}> = ({ eventId, title, sessionHashes, gameLabel }) => {
  const hashes = [...new Set(sessionHashes?.filter(Boolean) ?? [])];
  if (hashes.length === 0) {
    return <>{title}</>;
  }
  return (
    <>
      {hashes.map((hash, index) => (
        <React.Fragment key={hash}>
          {index > 0 && ', '}
          <Anchor
            inherit
            underline='hover'
            href={`/event/${eventId}/game/${encodeURIComponent(hash)}`}
            title={`${gameLabel}${hashes.length > 1 ? ` (${index + 1})` : ''}`}
          >
            {title}
            {hashes.length > 1 ? ` (${index + 1})` : ''}
          </Anchor>
        </React.Fragment>
      ))}
    </>
  );
};
