import * as React from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import { Redirect } from 'wouter';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { useStorage } from '#/hooks/storage';
import { useAuth } from '#/hooks/auth';

export const ProfileLogout: React.FC = () => {
  const api = useApi();
  const storage = useStorage();
  const auth = useAuth();
  const i18n = useI18n();
  usePageTitle(i18n._t('Logout'));
  storage.deleteAuthToken().deletePersonId().deleteEventId();
  api.setCredentials(0, '');
  auth.setIsLoggedIn(false);
  return <Redirect to='/' />;
};
