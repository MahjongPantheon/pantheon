import * as React from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import { Redirect } from 'wouter';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { useStorage } from '#/hooks/storage';
import { authCtx } from '#/hooks/auth';
import { useContext } from 'react';

export const ProfileLogout: React.FC = () => {
  const api = useApi();
  const storage = useStorage();
  const { setIsLoggedIn } = useContext(authCtx);
  const i18n = useI18n();
  usePageTitle(i18n._t('Logout'));
  storage.deleteAuthToken().deletePersonId().deleteEventId();
  api.setCredentials(0, '');
  setIsLoggedIn(false);
  return <Redirect to='/' />;
};
