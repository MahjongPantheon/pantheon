import { MantineColorScheme, MantineColorSchemeManager } from '@mantine/core';
import { Storage } from '../../../Common/storage';

// See also Tyr/app/services/themes.ts - we use names from there to sync themes
const themeToLocal: (theme?: string | null) => string = (theme): MantineColorScheme => {
  return ({
    day: 'light',
    night: 'dark',
  }[theme ?? 'day'] ?? 'light') as MantineColorScheme;
};

const themeFromLocal: (theme?: 'light' | 'dark' | 'auto') => string = (theme) => {
  return (
    {
      light: 'day',
      dark: 'night',
      auto: 'day',
    }[theme ?? 'light'] ?? 'day'
  );
};

export function colorSchemeManager(storage: Storage): MantineColorSchemeManager {
  return {
    get: (defaultValue): MantineColorScheme => {
      const themeValue = storage.getTheme();
      const currentThemeValue = themeValue ? themeToLocal(themeValue) : defaultValue;

      return currentThemeValue as MantineColorScheme;
    },

    set: (value) => {
      storage.setTheme(themeFromLocal(value));
    },

    subscribe: () => {},

    unsubscribe: () => {},

    clear: () => {
      storage.deleteTheme();
    },
  };
}
