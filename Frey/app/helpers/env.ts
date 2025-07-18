import dotenv from "dotenv";

type EnvVars = {
  DEBUG_TOKEN: string;
  INTERNAL_QUERY_SECRET: string;
  VERBOSE: string;
  HERMOD_URL_INTERNAL: string;
  MAIL_ACTION_KEY: string;
  ALLOWED_SENDER_DOMAINS: string;
  FORSETI_URL: string;
  COOKIE_DOMAIN: string;
  GULLVEIG_URL_INTERNAL: string;
  MIMIR_URL_INTERNAL: string;
  HUGIN_URL_INTERNAL: string;
  USERINFO_HOOK: string;
  USERINFO_HOOK_API_KEY: string;
  DB_FREY_HOST: string;
  DB_FREY_NAME: string;
  DB_FREY_USER: string;
  DB_FREY_PASSWORD: string;
  PORT: string;
  TZ: string;
};

const data: Partial<EnvVars> =
  dotenv.config({
    path:
      process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.development",
  })?.parsed ?? {};

process.env.TZ = data.TZ ?? "UTC";

export const env = {
  debug: {
    token: data.DEBUG_TOKEN ?? "",
    internalQuerySecret: data.INTERNAL_QUERY_SECRET ?? "",
  },
  port: data.PORT ?? 3000,
  db: {
    host: data.DB_FREY_HOST,
    username: data.DB_FREY_USER,
    password: data.DB_FREY_PASSWORD,
    dbname: data.DB_FREY_NAME,
  },
  mailer: {
    remoteUrl: data.HERMOD_URL_INTERNAL,
    remoteActionKey: data.MAIL_ACTION_KEY,
    mailerAddr: "noreply@" + (data.ALLOWED_SENDER_DOMAINS ?? "pantheon.local"),
    guiUrl: data.FORSETI_URL,
  },
  cookieDomain: data.COOKIE_DOMAIN,
  gullveigUrl: data.GULLVEIG_URL_INTERNAL,
  mimirUrl: data.MIMIR_URL_INTERNAL,
  huginUrl: data.HUGIN_URL_INTERNAL,
  userinfoHook: data.USERINFO_HOOK ?? null,
  userinfoHookApiKey: data.USERINFO_HOOK_API_KEY ?? "",
};
