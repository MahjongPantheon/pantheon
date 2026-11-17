// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { languageFromPath, languageLink, normalizeLanguage, supportedLanguages } from './languages';
import { useLanguage } from '../hooks/useLanguage';
import { useI18n } from '../hooks/i18n';
import { storageCtx } from '../hooks/storage';
import { Storage } from '../../../Common/storage';

function LanguageProbe() {
  return <span>{useLanguage()}:{useI18n()._t('For players')}</span>;
}

describe('page languages', () => {
  it.each([
    ['ja-JP', 'jp'], ['zh-CN', 'cn'], ['zh-TW', 'cn'], ['KO_kr', 'ko'],
    ['de-DE', 'de'], ['be-BY', 'be'], ['ru-RU', 'ru'], ['en-US', 'en'], ['fr', undefined],
  ])('normalizes browser and shared-cookie language %s', (input, expected) => {
    expect(normalizeLanguage(input)).toBe(expected);
  });

  it('recognizes an exact supported URL prefix', () => {
    expect(languageFromPath('/jp/forHosts?example=1#predefined')).toBe('jp');
    expect(languageFromPath('/enough/forHosts')).toBeUndefined();
    expect(languageFromPath('/')).toBeUndefined();
  });

  it('preserves the page, search and anchor when switching', () => {
    expect(languageLink('https://riichimahjong.org/ru/forHosts?example=1#predefined', 'de'))
      .toBe('/de/forHosts?example=1#predefined');
    expect(languageLink('/en', 'jp')).toBe('/jp');
    expect(languageLink('/', 'be')).toBe('/be');
  });

  it.each(['/howToPlay', '/yakuList'])('keeps %s exclusive to Russian', (page) => {
    expect(languageLink(`/ru${page}#section`, 'cn')).toBe('/cn');
    expect(languageLink(`/ru${page}#section`, 'ru')).toBe(`/ru${page}#section`);
  });

  it.each(supportedLanguages)('uses %s from the URL even inside a language router with a stale cookie', (language) => {
    const storage = Object.assign(new Storage(), { getLang: () => language === 'en' ? 'ru' : 'en' });
    const result = renderToStaticMarkup(
      <storageCtx.Provider value={storage}>
        <Router ssrPath={`/${language}/forHosts`}>
          <Router base={`/${language}`}><LanguageProbe /></Router>
        </Router>
      </storageCtx.Provider>
    );
    expect(result).toContain(`>${language}:`);
    if (language !== 'en') expect(result).not.toContain('For players');
  });
});
