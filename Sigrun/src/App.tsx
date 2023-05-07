import { useState } from 'react';
import { Button, MantineProvider, Text } from '@mantine/core';
import { HeaderMenuColored } from './AppHeader';
import { AnalyticsProvider } from './hooks/analytics';
import { StorageProvider } from './hooks/storage';
import { I18nProvider } from './hooks/i18n';
import { ApiProvider } from './hooks/api';
import { StorageStrategy } from '../../Common/storage';

export function App({ storageStrategy }: { storageStrategy: StorageStrategy }) {
  const [count, setCount] = useState(0);
  const links = [{ label: 'Test', link: 'http://kek.com' }];

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AnalyticsProvider>
        <StorageProvider strategy={storageStrategy}>
          <I18nProvider>
            <ApiProvider>
              <HeaderMenuColored links={links} />
              <div className='App'>
                <h1>Vite + React</h1>
                <Text>Welcome to Mantine!</Text>
                <Button>Kek</Button>
                <div className='card'>
                  <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                  <p>
                    Edit <code>src/App.tsx</code> and save to test HMR123
                  </p>
                </div>
                <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
              </div>
            </ApiProvider>
          </I18nProvider>
        </StorageProvider>
      </AnalyticsProvider>
    </MantineProvider>
  );
}
