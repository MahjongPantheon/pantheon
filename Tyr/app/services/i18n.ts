import { TranslationProvider, TranslationController } from 'i18n-dialect';
import { TranslationJson } from 'i18n-proto';

// TODO: exclude from primary bundle
import langRu from '../i18n/ru.json';
import langDe from '../i18n/de.json';
import { IDB } from './idb';
import { environment } from '#config';
export const supportedLanguages = [
  'en', 'ru', 'de'
];
const langs = {
  'ru': langRu,
  'de': langDe
};

export class I18nService {
  protected i18nController: TranslationController;
  protected i18n: TranslationProvider;

  constructor(private storage: IDB) {
    this.i18nController = new TranslationController(
      /* translationGetter: */(name: string, onReady: (name: string, contents: string) => void) => {
        switch (name) {
          case 'ru':
            onReady(name, JSON.stringify(langs[name]));
            break;
          case 'de':
            onReady(name, JSON.stringify(langs[name]));
            break;
          case 'en':
          default:
            let defaultTrn: TranslationJson = {
              items: [], meta: {
                projectIdVersion: '1',
                reportMsgidBugsTo: '',
                potCreationDate: '',
                poRevisionDate: '',
                lastTranslator: {
                  name: '',
                  email: ''
                },
                language: 'en',
                languageTeam: '',
                pluralForms: 'nplurals=1; plural=(n==1 ? 0 : 1)', // (n: number) => number
                mimeVersion: '',
                contentType: '',
                contentTransferEncoding: '',
                generatedBy: ''
              }
            };
            onReady('en', JSON.stringify(defaultTrn));
            break;
        }
      },
      /* onFailedSubstitution: */(str: string, substitutions) => {
        console.error(`Failed i18n substitution: ${str}`, substitutions);
      },
      /* defaultPluralSelect: */(factor: number) => factor == 1 ? 0 : 1 // default english plurality rule
    );
    this.i18n = new TranslationProvider(this.i18nController);
  }

  public init(onReady: (localeName: string) => void, onError: (error: any) => void) {
    // See also app.component.ts where this item is set
    let lang = this.storage.get(environment.idbLangKey, 'string');
    if (lang) {
      if (supportedLanguages.indexOf(lang) === -1) {
        this.storage.delete([environment.idbLangKey]);
        // pass further if wrong lang is contained in local storage
      } else {
        this.i18nController.setLocale(lang, onReady, onError);
        return;
      }
    }

    for (let lang of window.navigator.languages) {
      if (supportedLanguages.indexOf(lang) !== -1) {
        this.i18nController.setLocale(lang, onReady, onError);
        return;
      }
    }

    // default to en if nothing good found
    this.i18nController.setLocale('en', onReady, onError);
  }

  get _t() { return this.i18n._t; }
  get _pt() { return this.i18n._pt; }
  get _nt() { return this.i18n._nt; }
  get _npt() { return this.i18n._npt; }
  get _gg() { return this.i18n._gg; }
  get _ngg() { return this.i18n._ngg; }
  get _pgg() { return this.i18n._pgg; }
  get _npgg() { return this.i18n._npgg; }
}
