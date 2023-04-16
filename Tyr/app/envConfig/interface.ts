export type EnvConfig = {
  production: boolean;
  apiUrl: string;
  uaUrl: string;
  guiUrl: string;
  paUrl: string;
  cookieDomain: string | null;
  guiFix: (src: string) => string;
  statDomain: string | null;
  siteId: string | null;
  apiVersion: [number, number];
};
