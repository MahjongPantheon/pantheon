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

import { I18nService } from '../../services/i18n';
import * as React from 'react';
import { Checkbox, SimpleGrid, Stack, Title } from '@mantine/core';
import {
  yakuList,
  yakuWithPao,
  doubleYakuman,
  aggregatedYakuhai,
  separateYakuhai,
  windYaku,
} from '../../helpers/yaku';
import { GameConfig } from 'tsclients/proto/atoms.pb';

type YakuSettingsProps = {
  config: GameConfig;
  i18n: I18nService;
};

export const YakuSettings: React.FC<YakuSettingsProps> = ({ config, i18n }) => {
  const allowedYaku = new Set(config.rulesetConfig.allowedYaku);
  return (
    <Stack>
      <Checkbox
        label={i18n._t('Kuitan')}
        description={i18n._t(
          'Tanyao costs 1 han on open hand. If not checked, tanyao does not work on open hand.'
        )}
        checked={config.rulesetConfig.withKuitan}
        readOnly
      />
      <Checkbox
        label={i18n._t('Multiple yakumans')}
        description={i18n._t('Allow combination of yakumans, e.g. tsuuisou + daisangen')}
        checked={config.rulesetConfig.withMultiYakumans}
        readOnly
      />
      <Checkbox
        label={i18n._t('Enable aggregated yakuhai')}
        description={i18n._t(
          'When disabled, use separate yakuhai names like "East" and "White dragon" instead of aggregated names like "Yakuhai x3".'
        )}
        checked={config.rulesetConfig.useAggregatedYakuhai}
        readOnly
      />
      <Title order={4}>{i18n._t('Yaku allowed')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 1, xs: 2, sm: 3 }}>
        {yakuList
          .filter(({ id }) =>
            config.rulesetConfig.useAggregatedYakuhai
              ? !separateYakuhai.includes(id)
              : !aggregatedYakuhai.includes(id)
          )
          .filter(({ id }) => !windYaku.some((wind) => wind.round === id))
          .map((y) => {
            const wind = windYaku.find((candidate) => candidate.seat === y.id);
            if (wind) {
              const seatEnabled = allowedYaku.has(wind.seat);
              const roundEnabled = allowedYaku.has(wind.round);
              return (
                <Checkbox
                  key={wind.seat}
                  label={wind.name(i18n)}
                  checked={seatEnabled && roundEnabled}
                  indeterminate={seatEnabled !== roundEnabled}
                  aria-checked={
                    seatEnabled !== roundEnabled ? 'mixed' : seatEnabled && roundEnabled
                  }
                  readOnly
                />
              );
            }
            return (
              <Checkbox key={y.id} label={y.name(i18n)} checked={allowedYaku.has(y.id)} readOnly />
            );
          })}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Pao rule enabled for:')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 1, xs: 2, sm: 3 }}>
        {yakuWithPao.map((y) => (
          <Checkbox
            key={y.id}
            label={y.name(i18n)}
            checked={config.rulesetConfig.yakuWithPao.includes(y.id)}
            readOnly
          />
        ))}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Double yakuman:')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 1, xs: 2, sm: 3 }}>
        {doubleYakuman.map((y) => (
          <Checkbox
            key={y.id}
            label={y.name(i18n)}
            checked={config.rulesetConfig.doubleYakuman.includes(y.id)}
            readOnly
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
