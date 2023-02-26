export type EnvConfig = {
  production: boolean;
  apiUrl: string;
  uaUrl: string;
  guiUrl: string;
  cookieDomain: string | null;
  guiFix: (src: string) => string;
  statDomain: string | null;
  apiVersion: [number, number];
};
