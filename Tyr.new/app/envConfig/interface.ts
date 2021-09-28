export type EnvConfig = {
  production: boolean;
  apiUrl: string;
  uaUrl: string;
  guiUrl: string;
  keyPrefix: string;
  cookieDomain: string | null;
  guiFix: (src: string) => string;
  metrikaId: number;
  apiVersion: [number, number];
};
