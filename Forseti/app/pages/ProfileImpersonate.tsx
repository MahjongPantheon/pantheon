import * as React from 'react';
import { Redirect } from 'wouter';
import { useStorage } from '#/hooks/storage';

export const ProfileImpersonate: React.FC<{ params: { token: string; id: string } }> = ({
  params: { token, id },
}) => {
  const storage = useStorage();
  storage.setAuthToken(token).setPersonId(parseInt(id, 10));
  return <Redirect to='/profile/manage' />;
};
