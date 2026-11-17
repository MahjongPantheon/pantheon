// URL codes match the shared language preference used by the other Pantheon services.
export const supportedLanguages = ['en', 'ru', 'jp', 'cn', 'ko', 'de', 'be'] as const;
export type Language = (typeof supportedLanguages)[number];
export const languageNames: Record<Language, string> = {
  en: 'English', ru: 'Русский', jp: '日本語', cn: '中文', ko: '한국어', de: 'Deutsch', be: 'Беларуская',
};
export const htmlLanguages: Record<Language, string> = {
  en: 'en', ru: 'ru', jp: 'ja', cn: 'zh', ko: 'ko', de: 'de', be: 'be',
};
export function normalizeLanguage(value?: string | null): Language | undefined {
  const code = value?.toLowerCase().split(/[-_]/)[0];
  const normalized = code === 'ja' ? 'jp' : code === 'zh' ? 'cn' : code;
  return supportedLanguages.find((language) => language === normalized);
}
export function languageFromPath(path: string): Language | undefined {
  const code = path.split(/[/?#]/)[1];
  return supportedLanguages.find((language) => language === code);
}
// These reference pages have only a Russian edition.
export const russianOnlyPages = ['/howToPlay', '/yakuList'];
export function languageLink(url: string, language: Language): string {
  const parsed = new URL(url, 'https://bragi.invalid');
  const current = languageFromPath(parsed.pathname);
  let page = current ? parsed.pathname.slice(current.length + 1) : '';
  if (language !== 'ru' && russianOnlyPages.includes(page.replace(/\/$/, ''))) {
    page = '';
    parsed.hash = '';
  }
  return `/${language}${page}${parsed.search}${parsed.hash}`;
}
