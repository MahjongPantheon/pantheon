import * as React from 'react';

export const RatingTable: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  return <>rating of {eventId}</>;
};
