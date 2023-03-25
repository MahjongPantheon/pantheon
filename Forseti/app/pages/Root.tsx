import * as React from 'react';
import { useStorage } from '#/hooks/storage';

export const Root: React.FC = () => {
  const storage = useStorage();
  return (
    <div>
      Welcome, {storage.getPersonId()}, your token is {storage.getAuthToken()}
    </div>
  );
};
