import {
  isMantineColorScheme,
  LocalStorageColorSchemeManagerOptions,
  MantineColorScheme,
  MantineColorSchemeManager,
} from '@mantine/core';
import { storage } from '../hooks/storage';

// See also Tyr/app/services/themes.ts - we use names from there to sync themes
const themeToLocal: (theme?: string | null) => MantineColorScheme | undefined = (theme) => {
  return ({
    day: 'light',
    night: 'dark',
  }[theme ?? 'day'] ?? 'light') as MantineColorScheme | undefined;
};

const themeFromLocal: (theme?: MantineColorScheme | null) => string = (theme) => {
  return (
    {
      light: 'day',
      dark: 'night',
      auto: 'day',
    }[theme ?? 'light'] ?? 'day'
  );
};

export function localStorageColorSchemeManager({
  key = 'mantine-color-scheme',
}: LocalStorageColorSchemeManagerOptions = {}): MantineColorSchemeManager {
  let handleStorageEvent: (event: StorageEvent) => void;

  return {
    get: (defaultValue) => {
      try {
        return themeToLocal(storage.getTheme()) ?? defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set: (value) => {
      try {
        storage.setTheme(themeFromLocal(value));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          '[@mantine/core] Local storage color scheme manager was unable to save color scheme.',
          error
        );
      }
    },

    subscribe: (onUpdate) => {
      handleStorageEvent = (event) => {
        if (event.storageArea === window.localStorage && event.key === key) {
          isMantineColorScheme(event.newValue) && onUpdate(event.newValue);
        }
      };

      window.addEventListener('storage', handleStorageEvent);
    },

    unsubscribe: () => {
      window.removeEventListener('storage', handleStorageEvent);
    },

    clear: () => {
      window.localStorage.removeItem(key);
    },
  };
}
