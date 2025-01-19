import { AppShell, useMantineColorScheme } from '@mantine/core';
import { ReactNode } from 'react';

export const Main = ({ children }: { children: ReactNode }) => {
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  return (
    <AppShell.Main style={{ backgroundColor: isDark ? '#141517' : '#f8f9fa' }}>
      {children}
    </AppShell.Main>
  );
};
