export const supportedThemes = ['day', 'night'];

const dayTheme = {
  name: 'day',
  backgroundColor: '#F4F5F7',
  primaryColor: '#1565C0',
  secondaryColor: '#B8C0D1',
  textColor: '#000000',
} as Theme;

const nightTheme = {
  name: 'night',
  backgroundColor: '#282C34',
  primaryColor: '#1565C0',
  secondaryColor: '#37445C',
  textColor: '#E6E6E6',
} as Theme;

export const themes = [dayTheme, nightTheme];

export type Theme = {
  name: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
};
