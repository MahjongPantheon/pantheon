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

import { Redirect, Route, Router, Switch } from 'wouter';
import './App.css';
import { components } from './Nav';
import { supportedLanguages } from './services/i18n';
import { useLanguage } from './hooks/useLanguage';
import { Language } from './i18n/languages';
import { ComponentType } from 'react';
import { useAnchorScroll } from './hooks/useAnchorScroll';

const makeLangRoutes = (lang: Language) => () => {
  return (
    <Router base={`/${lang}`}>
      <Switch>
        {Object.entries(components)
          .filter(([, languages]) => lang in languages)
          .map(([url, languages]) => (
            <Route
              path={url}
              key={url}
              component={(languages as Partial<Record<Language, ComponentType>>)[lang]}
            />
          ))}
        <Route>
          <Redirect to='/' />
        </Route>
      </Switch>
    </Router>
  );
};

function AnchorScroll() {
  useAnchorScroll();
  return null;
}

const routes = supportedLanguages.map((lang) => ({ lang, Routes: makeLangRoutes(lang) }));

export function App() {
  const selectedLang = useLanguage();
  return (
    <>
      <AnchorScroll />
      <Route path='/'>
        <Redirect to={`/${selectedLang}`} />
      </Route>
      {routes.map(({ lang, Routes }) => (
        <Route path={`/${lang}/*?`} key={lang}>
          <Routes />
        </Route>
      ))}
    </>
  );
}
