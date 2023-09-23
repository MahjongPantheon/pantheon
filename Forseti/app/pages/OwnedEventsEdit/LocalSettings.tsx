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
import { NumberInput } from '@mantine/core';
import { IconChartHistogram, IconNumbers } from '@tabler/icons-react';
import { FormHandle } from './types';

type LocalSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const LocalSettings: React.FC<LocalSettingsProps> = ({ form, i18n }) => {
  return (
    <>
      <NumberInput
        {...form.getInputProps('event.seriesLength')}
        leftSection={<IconChartHistogram size='1rem' />}
        label={i18n._t('Series length')}
        description={i18n._t(
          'Count of session in game series. Set to 0 to disable series functionality.'
        )}
        defaultValue={0}
        step={5}
        min={0}
      />
      <NumberInput
        {...form.getInputProps('event.minGames')}
        leftSection={<IconNumbers size='1rem' />}
        label={i18n._t('Minimal games count')}
        description={i18n._t(
          'Minimal count of games the player should play to get into the rating table.'
        )}
        defaultValue={0}
        step={5}
        min={0}
      />
    </>
  );
};
