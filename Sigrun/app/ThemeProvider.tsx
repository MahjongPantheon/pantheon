import { EmotionCache } from '@emotion/cache';
import { MantineProvider, createTheme, v8CssVariablesResolver } from '@mantine/core';
import { MantineEmotionProvider, emotionTransform } from '@mantine/emotion';
import { ReactNode, useMemo } from 'react';
import { Storage } from '../../Common/storage';
import { emotionCache as browserEmotionCache } from './emotion/cache';
import { colorSchemeManager } from './helpers/colorSchemeManager';
import { getThemeOptions } from './helpers/theme';
import '@mantine/core/styles.css';
import '@mantine/nprogress/styles.css';
import '@mantine/charts/styles.css';

export function ThemeProvider({
  children,
  storage,
  dimmed,
  emotionCache = browserEmotionCache,
}: {
  children: ReactNode;
  storage: Storage;
  dimmed: boolean;
  emotionCache?: EmotionCache;
}) {
  const manager = useMemo(() => colorSchemeManager(storage), [storage]);
  const theme = useMemo(() => createTheme(getThemeOptions(dimmed)), [dimmed]);

  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={manager}
      defaultColorScheme='light'
      cssVariablesResolver={v8CssVariablesResolver}
      stylesTransform={emotionTransform}
    >
      <MantineEmotionProvider cache={emotionCache}>{children}</MantineEmotionProvider>
    </MantineProvider>
  );
}
