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
import BugsEn from './pages/bugs_en.mdx';
import ForPlayerEn from './pages/forPlayers_en.mdx';
import ForHostsEn from './pages/forHosts_en.mdx';
import GetStartedEn from './pages/getStarted_en.mdx';
import CodeOfConductEn from './pages/codeOfConduct_en.mdx';
import SeatingsEn from './pages/seatings_en.mdx';
import IndexPageRu from './pages/index_ru.mdx';
import HowToPlayRu from './pages/howToPlay_ru.mdx';
import BugsRu from './pages/bugs_ru.mdx';
import ForPlayersRu from './pages/forPlayers_ru.mdx';
import ForHostsRu from './pages/forHosts_ru.mdx';
import GetStartedRu from './pages/getStarted_ru.mdx';
import CodeOfConductRu from './pages/codeOfConduct_ru.mdx';
import SeatingsRu from './pages/seatings_ru.mdx';
import YakuListRu from './pages/yakuList_ru.mdx';
import IndexPageJp from './pages/index_jp.mdx';
import BugsJp from './pages/bugs_jp.mdx';
import ForPlayerJp from './pages/forPlayers_jp.mdx';
import ForHostsJp from './pages/forHosts_jp.mdx';
import GetStartedJp from './pages/getStarted_jp.mdx';
import CodeOfConductJp from './pages/codeOfConduct_jp.mdx';
import SeatingsJp from './pages/seatings_jp.mdx';
import IndexPageCn from './pages/index_cn.mdx';
import BugsCn from './pages/bugs_cn.mdx';
import ForPlayerCn from './pages/forPlayers_cn.mdx';
import ForHostsCn from './pages/forHosts_cn.mdx';
import GetStartedCn from './pages/getStarted_cn.mdx';
import CodeOfConductCn from './pages/codeOfConduct_cn.mdx';
import SeatingsCn from './pages/seatings_cn.mdx';
import IndexPageKo from './pages/index_ko.mdx';
import BugsKo from './pages/bugs_ko.mdx';
import ForPlayerKo from './pages/forPlayers_ko.mdx';
import ForHostsKo from './pages/forHosts_ko.mdx';
import GetStartedKo from './pages/getStarted_ko.mdx';
import CodeOfConductKo from './pages/codeOfConduct_ko.mdx';
import SeatingsKo from './pages/seatings_ko.mdx';
import IndexPageDe from './pages/index_de.mdx';
import BugsDe from './pages/bugs_de.mdx';
import ForPlayerDe from './pages/forPlayers_de.mdx';
import ForHostsDe from './pages/forHosts_de.mdx';
import GetStartedDe from './pages/getStarted_de.mdx';
import CodeOfConductDe from './pages/codeOfConduct_de.mdx';
import SeatingsDe from './pages/seatings_de.mdx';
import IndexPageBe from './pages/index_be.mdx';
import BugsBe from './pages/bugs_be.mdx';
import ForPlayerBe from './pages/forPlayers_be.mdx';
import ForHostsBe from './pages/forHosts_be.mdx';
import GetStartedBe from './pages/getStarted_be.mdx';
import CodeOfConductBe from './pages/codeOfConduct_be.mdx';
import SeatingsBe from './pages/seatings_be.mdx';

enum Path {
  Index = '/',
  HowToPlay = '/howToPlay',
  CodeOfConduct = '/codeOfConduct',
  GetStarted = '/getStarted',
  ForPlayers = '/forPlayers',
  ForHosts = '/forHosts',
  Reports = '/reports',
  Seatings = '/seatings',
  YakuList = '/yakuList',
}

export const links = (i18n: { _t: (text: string) => string }) => [
  { link: Path.ForPlayers, label: i18n._t('For players') },
  { link: Path.ForHosts, label: i18n._t('For hosts') },
  { link: Path.Reports, label: i18n._t('Have issue?') },
  {
    link: 'https://github.com/MahjongPantheon/pantheon/tree/master/docs/technical',
    label: i18n._t('Tech info'),
  },
  { link: Path.CodeOfConduct, label: i18n._t('Terms & conditions') },
];

export const components = {
  [Path.Index]: {
    en: IndexPageEn,
    jp: IndexPageJp,
    cn: IndexPageCn,
    ko: IndexPageKo,
    de: IndexPageDe,
    be: IndexPageBe,
    ru: IndexPageRu,
  },
  [Path.HowToPlay]: { ru: HowToPlayRu },
  [Path.ForPlayers]: {
    en: ForPlayerEn,
    jp: ForPlayerJp,
    cn: ForPlayerCn,
    ko: ForPlayerKo,
    de: ForPlayerDe,
    be: ForPlayerBe,
    ru: ForPlayersRu,
  },
  [Path.ForHosts]: {
    en: ForHostsEn,
    jp: ForHostsJp,
    cn: ForHostsCn,
    ko: ForHostsKo,
    de: ForHostsDe,
    be: ForHostsBe,
    ru: ForHostsRu,
  },
  [Path.GetStarted]: {
    en: GetStartedEn,
    jp: GetStartedJp,
    cn: GetStartedCn,
    ko: GetStartedKo,
    de: GetStartedDe,
    be: GetStartedBe,
    ru: GetStartedRu,
  },
  [Path.Reports]: {
    en: BugsEn,
    jp: BugsJp,
    cn: BugsCn,
    ko: BugsKo,
    de: BugsDe,
    be: BugsBe,
    ru: BugsRu,
  },
  [Path.Seatings]: {
    en: SeatingsEn,
    jp: SeatingsJp,
    cn: SeatingsCn,
    ko: SeatingsKo,
    de: SeatingsDe,
    be: SeatingsBe,
    ru: SeatingsRu,
  },
  [Path.CodeOfConduct]: {
    en: CodeOfConductEn,
    jp: CodeOfConductJp,
    cn: CodeOfConductCn,
    ko: CodeOfConductKo,
    de: CodeOfConductDe,
    be: CodeOfConductBe,
    ru: CodeOfConductRu,
  },
  [Path.YakuList]: { ru: YakuListRu },
};

export const pagePaths = Object.entries(components).flatMap(([path, languages]) =>
  Object.keys(languages).map((language) => `/${language}${path === '/' ? '' : path}`)
);
