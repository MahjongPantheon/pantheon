export type EnvConfig = {
  production: boolean;
  apiUrl: string;
  uaUrl: string;
  guiUrl: string;
  ratatoskUrl: string;
  cookieDomain: string | null;
  guiFix: (src: string) => string;
  metrikaId: number;
  idbTokenKey: string;
  idbIdKey: string;
  idbSettingsKey: string;
  idbEventKey: string;
  idbLangKey: string;
  idbThemeKey: string;
  apiVersion: [number, number];
};
