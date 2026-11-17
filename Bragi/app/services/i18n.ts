/*  Bragi: Pantheon landing pages
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { TranslationProvider, TranslationController } from 'i18n-dialect';
import { TranslationJson } from 'i18n-proto';

import langRu from '../i18n/ru.json';
import langDe from '../i18n/de.json';
import langJp from '../i18n/jp.json';
import langCn from '../i18n/cn.json';
import langKo from '../i18n/ko.json';
import langBe from '../i18n/be.json';
import { IStorage } from '../../../Common/storage';
import { Language, languageFromPath, normalizeLanguage } from '../i18n/languages';
export { supportedLanguages } from '../i18n/languages';
const langs = { ru: langRu, de: langDe, jp: langJp, cn: langCn, ko: langKo, be: langBe };

export class I18nService {
  protected i18nController: TranslationController;
  protected i18n: TranslationProvider;

  constructor(
    private readonly storage: IStorage,
    locale?: Language
  ) {
    this.i18nController = new TranslationController(
      /* translationGetter: */ (
        name: string,
        onReady: (name: string, contents: string) => void
      ) => {
        if (name in langs) {
          onReady(name, JSON.stringify(langs[name as keyof typeof langs]));
        } else {
          const defaultTrn: TranslationJson = {
            items: [],
            meta: {
              projectIdVersion: '1',
              reportMsgidBugsTo: '',
              potCreationDate: '',
              poRevisionDate: '',
              lastTranslator: {
                name: '',
                email: '',
              },
              language: 'en',
              languageTeam: '',
              pluralForms: 'nplurals=1; plural=(n==1 ? 0 : 1)', // (n: number) => number
              mimeVersion: '',
              contentType: '',
              contentTransferEncoding: '',
              generatedBy: '',
            },
          };
          onReady('en', JSON.stringify(defaultTrn));
        }
      },
      /* onFailedSubstitution: */ (str: string, substitutions) => {
        console.error(`Failed i18n substitution: ${str}`, substitutions);
      },
      /* defaultPluralSelect: */ (factor: number) => (factor == 1 ? 0 : 1) // default english plurality rule
    );
    this.i18n = new TranslationProvider(this.i18nController);
    if (locale) this.i18nController.setLocale(locale, () => {}, console.error);
  }

  public init(onReady: (localeName: string) => void, onError: (error: any) => void) {
    const pathLanguage = !import.meta.env.SSR
      ? languageFromPath(window.location.pathname)
      : undefined;
    const savedLanguage = normalizeLanguage(this.storage.getLang());
    const browserLanguage = !import.meta.env.SSR
      ? window.navigator.languages.map(normalizeLanguage).find(Boolean)
      : undefined;
    this.i18nController.setLocale(
      pathLanguage ?? savedLanguage ?? browserLanguage ?? 'en',
      onReady,
      onError
    );
  }

  get _t() {
    return this.i18n._t;
  }
  get _pt() {
    return this.i18n._pt;
  }
  get _nt() {
    return this.i18n._nt;
  }
  get _npt() {
    return this.i18n._npt;
  }
  get _gg() {
    return this.i18n._gg;
  }
  get _ngg() {
    return this.i18n._ngg;
  }
  get _pgg() {
    return this.i18n._pgg;
  }
  get _npgg() {
    return this.i18n._npgg;
  }
}
