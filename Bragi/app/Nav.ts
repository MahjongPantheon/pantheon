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
import IndexPageEn from './pages/index_en.mdx';
import IndexPageRu from './pages/index_ru.mdx';
import AboutEn from './pages/about_en.mdx';
import BugsEn from './pages/bugs_en.mdx';
import ForPlayerEn from './pages/forPlayers_en.mdx';
import ForHostsEn from './pages/forHosts_en.mdx';
import GetStartedEn from './pages/getStarted_en.mdx';
import CodeOfConductEn from './pages/codeOfConduct_en.mdx';
import AboutRu from './pages/about_ru.mdx';
import BugsRu from './pages/bugs_ru.mdx';
import ForPlayersRu from './pages/forPlayers_ru.mdx';
import ForHostsRu from './pages/forHosts_ru.mdx';
import GetStartedRu from './pages/getStarted_ru.mdx';
import CodeOfConductRu from './pages/codeOfConduct_ru.mdx';

enum Path {
  Index = '/',
  About = '/about',
  CodeOfConduct = '/codeOfConduct',
  GetStarted = '/getStarted',
  ForPlayers = '/forPlayers',
  ForHosts = '/forOrganizators',
  Reports = '/reports',
}

export const links = [
  { link: Path.ForPlayers, label: { en: 'For players', ru: 'Игрокам' } },
  { link: Path.ForHosts, label: { en: 'For hosts', ru: 'Организаторам' } },
  { link: Path.Reports, label: { en: 'Have issue?', ru: 'Проблема?' } },
  {
    link: 'https://github.com/MahjongPantheon/pantheon/tree/master/docs/technical',
    label: { en: 'Tech info', ru: 'Тех.детали' },
  },
  { link: Path.CodeOfConduct, label: { en: 'Terms & conditions', ru: 'Условия и нормы' } },
  { link: Path.About, label: { en: 'About us', ru: 'О нас' } },
];

export const components = {
  [Path.Index]: { en: IndexPageEn, ru: IndexPageRu },
  [Path.About]: { en: AboutEn, ru: AboutRu },
  [Path.ForPlayers]: { en: ForPlayerEn, ru: ForPlayersRu },
  [Path.ForHosts]: { en: ForHostsEn, ru: ForHostsRu },
  [Path.GetStarted]: { en: GetStartedEn, ru: GetStartedRu },
  [Path.Reports]: { en: BugsEn, ru: BugsRu },
  [Path.CodeOfConduct]: { en: CodeOfConductEn, ru: CodeOfConductRu },
};
