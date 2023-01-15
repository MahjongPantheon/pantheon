export type EnvConfig = {
  production: boolean;
  apiUrl: string;
  uaUrl: string;
  guiUrl: string;
  cookieDomain: string | null;
  guiFix: (src: string) => string;
  metrikaId: number;
  idbTokenKey: string;
  idbIdKey: string;
  idbEventKey: string;
  idbLangKey: string;
  idbThemeKey: string;
  idbDeviceModeKey: string;
  apiVersion: [number, number];
};
