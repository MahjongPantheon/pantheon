/*  Sigrun: rating tables and statistics frontend
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

import * as React from 'react';
import { Checkbox, SimpleGrid, Stack, Title } from '@mantine/core';
import { GameConfig } from '../../clients/proto/atoms.pb';
import { I18nService } from '../../services/i18n';
import { doubleYakuman, yakuList, yakuWithPao } from '../../helpers/yaku';

type YakuSettingsProps = {
  config: GameConfig;
  i18n: I18nService;
};

export const YakuSettings: React.FC<YakuSettingsProps> = ({ config, i18n }) => {
  return (
    <Stack>
      <Checkbox
        label={i18n._t('Kuitan')}
        description={i18n._t(
          'Tanyao costs 1 han on open hand. If not checked, tanyao does not work on open hand.'
        )}
        checked={config.rulesetConfig.withKuitan}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Multiple yakumans')}
        description={i18n._t('Allow combination of yakumans, e.g. tsuuisou + daisangen')}
        checked={config.rulesetConfig.withMultiYakumans}
        onChange={() => {}}
      />
      <Title order={4}>{i18n._t('Yaku allowed')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 3, '48rem': 2, '36rem': 1 }}>
        {yakuList.map((y, idx) => (
          <Checkbox
            key={`yaku_${idx}`}
            label={y.name(i18n)}
            checked={config.rulesetConfig.allowedYaku.includes(y.id)}
            onChange={() => {}}
          />
        ))}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Pao rule enabled for:')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 3, '48rem': 2, '36rem': 1 }}>
        {yakuWithPao.map((y, idx) => (
          <Checkbox
            key={`yaku_${idx}`}
            label={y.name(i18n)}
            checked={config.rulesetConfig.yakuWithPao.includes(y.id)}
            onChange={() => {}}
          />
        ))}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Double Yakuman:')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 3, '48rem': 2, '36rem': 1 }}>
        {doubleYakuman.map((y, idx) => (
          <Checkbox
            key={`yaku_${idx}`}
            label={y.name(i18n)}
            checked={config.rulesetConfig.doubleYakuman.includes(y.id)}
            onChange={() => {}}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
