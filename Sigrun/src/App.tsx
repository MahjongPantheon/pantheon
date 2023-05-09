import { MantineProvider } from '@mantine/core';
import { AppHeader } from './AppHeader';
import { AnalyticsProvider } from './hooks/analytics';
import { StorageProvider } from './hooks/storage';
import { I18nProvider } from './hooks/i18n';
import { ApiProvider } from './hooks/api';
import { StorageStrategy } from '../../Common/storage';
import { EventList } from './pages/EventList';
import { Route, Switch } from 'wouter';

export function App({ storageStrategy }: { storageStrategy: StorageStrategy }) {
  const links = [{ label: 'Test', link: 'http://kek.com' }];

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AnalyticsProvider>
        <StorageProvider strategy={storageStrategy}>
          <I18nProvider>
            <ApiProvider>
              <AppHeader links={links} />
              <Switch>
                <Route path='/' component={EventList} />
                <Route path='/page/:page' component={EventList} />
              </Switch>
            </ApiProvider>
          </I18nProvider>
        </StorageProvider>
      </AnalyticsProvider>
    </MantineProvider>
  );
}
