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

import { Center, Group, NumberInput, Radio, SimpleGrid, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { I18nService } from '../../services/i18n';
import { FormHandle } from './types';
import { UmaType } from '../../clients/proto/atoms.pb';

type UmaSelectProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const UmaSelect: React.FC<UmaSelectProps> = ({ form, i18n }) => {
  return (
    <>
      <Radio.Group
        label={i18n._t('Select uma bonus type')}
        {...form.getInputProps('ruleset.umaType')}
      >
        <Group mt='xs'>
          <Radio value={UmaType.UMA_TYPE_UMA_SIMPLE} label={i18n._t('Simple rank-based')} />
          <Radio value={UmaType.UMA_TYPE_UMA_COMPLEX} label={i18n._t('Complex position-based')} />
        </Group>
      </Radio.Group>
      {form.getTransformedValues().ruleset.umaType === UmaType.UMA_TYPE_UMA_SIMPLE && (
        <SimpleGrid cols={2}>
          <NumberInput
            hideControls
            label={i18n._t('Uma bonus for 1st place')}
            defaultValue={15000}
            {...form.getInputProps('ruleset.uma.place1')}
          />
          <NumberInput
            hideControls
            label={i18n._t('Uma bonus for 2nd place')}
            defaultValue={5000}
            {...form.getInputProps('ruleset.uma.place2')}
          />
          <NumberInput
            hideControls
            label={i18n._t('Uma penalty for 3rd place')}
            defaultValue={-5000}
            {...form.getInputProps('ruleset.uma.place3')}
          />
          <NumberInput
            hideControls
            label={i18n._t('Uma penalty for 4th place')}
            defaultValue={-15000}
            {...form.getInputProps('ruleset.uma.place4')}
          />
        </SimpleGrid>
      )}
      {form.getTransformedValues().ruleset.umaType === UmaType.UMA_TYPE_UMA_COMPLEX && (
        <Group align='flex-end'>
          <Stack w='20%'>
            <Center>{i18n._t('Place / Session result')}</Center>
            <Text h='34px' align='right'>
              {i18n._t('1st')}
            </Text>
            <Text h='34px' align='right'>
              {i18n._t('2nd')}
            </Text>
            <Text h='34px' align='right'>
              {i18n._t('3rd')}
            </Text>
            <Text h='34px' align='right'>
              {i18n._t('4th')}
            </Text>
          </Stack>
          <Stack w='21%'>
            <Center>
              <Text>{i18n._t('3 players with score less than starting')}</Text>
            </Center>
            <NumberInput
              hideControls
              defaultValue={12000}
              {...form.getInputProps('ruleset.complexUma.neg3.place1')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.neg3.place2')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.neg3.place3')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.neg3.place4')}
            />
          </Stack>
          <Stack w='21%'>
            <Center>
              <Text>{i18n._t('1 player with score less than starting')}</Text>
            </Center>
            <NumberInput
              hideControls
              defaultValue={12000}
              {...form.getInputProps('ruleset.complexUma.neg1.place1')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.neg1.place2')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.neg1.place3')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.neg1.place4')}
            />
          </Stack>
          <Stack w='21%'>
            <Text>{i18n._t('Otherwise')}</Text>
            <NumberInput
              hideControls
              defaultValue={12000}
              {...form.getInputProps('ruleset.complexUma.otherwise.place1')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.otherwise.place2')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.otherwise.place3')}
            />
            <NumberInput
              hideControls
              defaultValue={8000}
              {...form.getInputProps('ruleset.complexUma.otherwise.place4')}
            />
          </Stack>
        </Group>
      )}
    </>
  );
};
