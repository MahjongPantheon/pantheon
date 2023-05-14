import * as React from 'react';

export const EventInfo: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  return <>info of {eventId}</>;
};
