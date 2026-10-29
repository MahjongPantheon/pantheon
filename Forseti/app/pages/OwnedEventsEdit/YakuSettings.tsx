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
import {
  yakuList,
  yakuWithPao,
  doubleYakuman,
  aggregatedYakuhai,
  separateYakuhai,
  windYaku,
} from '../../helpers/yaku';
import { FormHandle } from './types';

type YakuSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const YakuSettings: React.FC<YakuSettingsProps> = ({ form, i18n }) => {
  const aggregated = form.useWatchValue('ruleset.useAggregatedYakuhai');
  return (
    <Stack>
      <Checkbox
        label={i18n._t('Kuitan')}
        description={i18n._t(
          'Tanyao costs 1 han on open hand. If not checked, tanyao does not work on open hand.'
        )}
        data-testid='forseti-event-settings-yaku-settings-ruleset-with-kuitan'
        key={form.key('ruleset.withKuitan')}
        {...form.getInputProps('ruleset.withKuitan', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Multiple yakumans')}
        description={i18n._t('Allow combination of yakumans, e.g. tsuuisou + daisangen')}
        data-testid='forseti-event-settings-yaku-settings-ruleset-with-multi-yakumans'
        key={form.key('ruleset.withMultiYakumans')}
        {...form.getInputProps('ruleset.withMultiYakumans', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Enable aggregated yakuhai')}
        description={i18n._t(
          'When disabled, use separate yakuhai names like "East" and "White dragon" instead of aggregated names like "Yakuhai x3".'
        )}
        data-testid='forseti-event-settings-yakuhai-aggregated'
        key={form.key('ruleset.useAggregatedYakuhai')}
        {...form.getInputProps('ruleset.useAggregatedYakuhai', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Yaku allowed')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 1, xs: 2, sm: 3 }}>
        {yakuList
          .filter(({ id }) =>
            aggregated ? !separateYakuhai.includes(id) : !aggregatedYakuhai.includes(id)
          )
          .filter(({ id }) => !windYaku.some((wind) => wind.round === id))
          .map((y) => {
            const wind = windYaku.find((candidate) => candidate.seat === y.id);
            if (wind) {
              return <WindCheckbox key={wind.seat} form={form} i18n={i18n} wind={wind} />;
            }
            return (
              <Checkbox
                data-testid={`forseti-event-settings-yaku-allowed-${y.id}`}
                key={form.key(`ruleset.allowedYaku.${y.id}`)}
                label={y.name(i18n)}
                {...form.getInputProps(`ruleset.allowedYaku.${y.id}`, { type: 'checkbox' })}
              />
            );
          })}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Pao rule enabled for:')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 1, xs: 2, sm: 3 }}>
        {yakuWithPao.map((y) => (
          <Checkbox
            data-testid={`forseti-event-settings-yaku-pao-${y.id}`}
            key={form.key(`ruleset.yakuWithPao.${y.id}`)}
            label={y.name(i18n)}
            {...form.getInputProps(`ruleset.yakuWithPao.${y.id}`, { type: 'checkbox' })}
          />
        ))}
      </SimpleGrid>
      <Title order={4}>{i18n._t('Double yakuman:')}</Title>
      <SimpleGrid spacing='lg' cols={{ base: 1, xs: 2, sm: 3 }}>
        {doubleYakuman.map((y) => (
          <Checkbox
            data-testid={`forseti-event-settings-yaku-double-${y.id}`}
            key={form.key(`ruleset.doubleYakuman.${y.id}`)}
            label={y.name(i18n)}
            {...form.getInputProps(`ruleset.doubleYakuman.${y.id}`, { type: 'checkbox' })}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};

function WindCheckbox({
  form,
  i18n,
  wind,
}: YakuSettingsProps & { wind: (typeof windYaku)[number] }) {
  const seatEnabled = !!form.useWatchValue(`ruleset.allowedYaku.${wind.seat}`);
  const roundEnabled = !!form.useWatchValue(`ruleset.allowedYaku.${wind.round}`);
  return (
    <Checkbox
      data-testid={`forseti-event-settings-yaku-allowed-${wind.seat}`}
      label={wind.name(i18n)}
      checked={seatEnabled && roundEnabled}
      indeterminate={seatEnabled !== roundEnabled}
      aria-checked={seatEnabled !== roundEnabled ? 'mixed' : seatEnabled && roundEnabled}
      onChange={(event) => {
        const enabled = event.currentTarget.checked;
        form.setFieldValue('ruleset.allowedYaku', {
          ...form.getValues().ruleset.allowedYaku,
          [wind.seat]: enabled,
          [wind.round]: enabled,
        });
      }}
    />
  );
}
