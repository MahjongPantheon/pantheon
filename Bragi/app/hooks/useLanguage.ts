import { useLocation, useRouter } from 'wouter';
import { useStorage } from './storage';
import { languageFromPath, normalizeLanguage } from '../i18n/languages';

export function useLanguage() {
  const [location] = useLocation();
  const router = useRouter();
  const storage = useStorage();
  return languageFromPath(router.base + location) ?? normalizeLanguage(storage.getLang()) ?? 'en';
}
