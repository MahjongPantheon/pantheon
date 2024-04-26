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

import { Redirect, Route, Router, Switch, useRouter } from 'wouter';
import './App.css';
import { components } from './Nav';
import { supportedLanguages } from './services/i18n';
import { useStorage } from './hooks/storage';

const makeLangRoutes = (lang: string) => () => {
  const router = useRouter();

  return (
    <Router base={`/${lang}`} parent={router}>
      <Switch>
        {Object.keys(components).map((url) => (
          <Route
            path={url}
            key={url}
            component={components[url as keyof typeof components][lang as 'ru' | 'en']}
          />
        ))}
      </Switch>
    </Router>
  );
};

export function App() {
  const routes = supportedLanguages.map((lang) => makeLangRoutes(lang));
  const selectedLang = useStorage().getLang() ?? 'en';
  return (
    <>
      <Route path='/'>
        <Redirect to={`/${selectedLang}`} />
      </Route>
      {routes.map((Routes, idx) => (
        <Routes key={`route_${idx}`} />
      ))}
    </>
  );
}
