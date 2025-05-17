/*  Forseti: personal area & event control panel
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
import { yakuList, yakuWithPao, doubleYakuman } from '../../helpers/yaku';
import { FormHandle } from './types';

type YakuSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const YakuSettings: React.FC<YakuSettingsProps> = ({ form, i18n }) => {
  return (
    <Stack>
      <Checkbox
        label={i18n._t('Kuitan')}
        description={i18n._t(
          'Tanyao costs 1 han on open hand. If not checked, tanyao does not work on open hand.'
        )}
        {...form.getInputProps('ruleset.withKuitan', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Multiple yakumans')}
        description={i18n._t('Allow combination of yakumans, e.g. tsuuisou + daisangen')}
        {...form.getInputProps('ruleset.withMultiYakumans', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Yaku allowed')}</Title>
      <SimpleGrid
        spacing='lg'
        cols={3}
        breakpoints={[
          { maxWidth: '48rem', cols: 2 },
          { maxWidth: '36rem', cols: 1 },
        ]}
      >
        {yakuList.map((y, idx) => (
          <Checkbox
            key={`yaku_${idx}`}
            label={y.name(i18n)}
            {...form.getInputProps(`ruleset.allowedYaku.${y.id}`, { type: 'checkbox' })}
          />
        ))}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Pao rule enabled for:')}</Title>
      <SimpleGrid
        spacing='lg'
        cols={3}
        breakpoints={[
          { maxWidth: '48rem', cols: 2 },
          { maxWidth: '36rem', cols: 1 },
        ]}
      >
        {yakuWithPao.map((y, idx) => (
          <Checkbox
            key={`yaku_${idx}`}
            label={y.name(i18n)}
            {...form.getInputProps(`ruleset.yakuWithPao.${y.id}`, { type: 'checkbox' })}
          />
        ))}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Double yakuman:')}</Title>
      <SimpleGrid
        spacing='lg'
        cols={3}
        breakpoints={[
          { maxWidth: '48rem', cols: 2 },
          { maxWidth: '36rem', cols: 1 },
        ]}
      >
        {doubleYakuman.map((y, idx) => (
          <Checkbox
            key={`yaku_${idx}`}
            label={y.name(i18n)}
            {...form.getInputProps(`ruleset.doubleYakuman.${y.id}`, { type: 'checkbox' })}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
