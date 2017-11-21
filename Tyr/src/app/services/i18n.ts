import { Injectable } from '@angular/core';
import { TranslationProvider, TranslationController } from 'i18n-dialect';
import { TranslationJson } from 'i18n-proto';

// TODO: exclude from primary bundle
import * as langRu from '../../i18n/ru.json';
const supportedLanguages = [
  'en', 'ru'
];
const langs = {
  'ru': langRu
};

@Injectable()
export class I18nService {
  protected i18nController: TranslationController;
  protected i18n: TranslationProvider;

  constructor() {
    this.i18nController = new TranslationController(
      /* translationGetter: */(name: string, onReady: (name: string, contents: string) => void) => {
        switch (name) {
          case 'ru':
            onReady(name, JSON.stringify(langs[name]));
            break;
          case 'en':
          default:
            let defaultTrn: TranslationJson = { items: [], meta: {} };
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

  public init(onReady: (localeName: string) => void) {
    for (let lang of window.navigator.languages) {
      if (supportedLanguages.indexOf(lang) !== -1) {
        this.i18nController.setLocale(lang, onReady);
        return;
      }
    }

    // default to en if nothing good found
    this.i18nController.setLocale('en', onReady);
  }

  public _t = this.i18n._t;
  public _pt = this.i18n._pt;
  public _nt = this.i18n._nt;
  public _npt = this.i18n._npt;
  public _gg = this.i18n._gg;
  public _ngg = this.i18n._ngg;
  public _pgg = this.i18n._pgg;
  public _npgg = this.i18n._npgg;
}
