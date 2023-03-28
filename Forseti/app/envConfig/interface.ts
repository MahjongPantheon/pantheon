export type EnvConfig = {
  production: boolean;
  apiUrl: string;
  uaUrl: string;
  guiUrl: string;
  rootUrl: string;
  adminEmail: string;
  cookieDomain: string | null;
  guiFix: (src: string) => string;
  statDomain: string | null;
  siteId: string | null;
};
