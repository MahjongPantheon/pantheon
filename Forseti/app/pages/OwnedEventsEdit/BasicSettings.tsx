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
import { Text, Select, Stack, Textarea, TextInput, Radio, Group, Checkbox } from '@mantine/core';
import { IconAbc, IconChecklist, IconMap2 } from '@tabler/icons-react';
import { EventCustom, FormHandle } from './types';
import { EventType, RulesetConfig } from '../../clients/proto/atoms.pb';

type BasicSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
  timezones: Array<{ value: string; label: string }>;
  rulesets: Array<{ value: string; label: string; rules: RulesetConfig }>;
  newEvent: boolean;
  setFormValues: (eventData: EventCustom, currentRuleset: RulesetConfig) => void;
};

export const BasicSettings: React.FC<BasicSettingsProps> = ({
  newEvent,
  rulesets,
  timezones,
  form,
  i18n,
  setFormValues,
}) => {
  const typeMap: Record<EventType, string> = {
    [EventType.EVENT_TYPE_UNSPECIFIED]: '',
    [EventType.EVENT_TYPE_LOCAL]: i18n._t('Local rating'),
    [EventType.EVENT_TYPE_ONLINE]: i18n._t('Online event'),
    [EventType.EVENT_TYPE_TOURNAMENT]: i18n._t('Tournament'),
  };
  return (
    <>
      <Stack>
        {!newEvent && (
          <Text>
            Type: {typeMap[form.getTransformedValues().event.type ?? EventType.EVENT_TYPE_LOCAL]}
          </Text>
        )}
        {newEvent && (
          <>
            <Radio.Group label={i18n._t('Select event type')} {...form.getInputProps('event.type')}>
              <Group mt='xs'>
                {(Object.keys(typeMap) as EventType[])
                  .filter((v) => v !== EventType.EVENT_TYPE_UNSPECIFIED)
                  .map((k, idx) => (
                    <Radio key={`rad_${idx}`} value={k} label={typeMap[k]} />
                  ))}
              </Group>
            </Radio.Group>
          </>
        )}
        <TextInput
          withAsterisk
          icon={<IconAbc size='1rem' />}
          label={i18n._t('Event title')}
          {...form.getInputProps('event.title')}
        />
        <Checkbox
          label={i18n._t('Show in ratings global list')}
          description={i18n._t(
            'If checked, the event will be publicly visible on main page of ratings subsystem. If unchecked, event will not be visible in the list, but still will be accessible via particular link'
          )}
          {...form.getInputProps('event.isListed', { type: 'checkbox' })}
        />
        {newEvent && (
          <Select
            icon={<IconChecklist size='1rem' />}
            label={i18n._t('Basic ruleset')}
            description={i18n._t(
              'Ruleset to be used as a template for the event. Fine tuning is available in adjacent tabs. Please note that all ruleset settings will be reset when you select another ruleset here.'
            )}
            data={rulesets}
            {...form.getInputProps('event.ruleset')}
            onChange={(v) => {
              if (v) {
                form.setFieldValue('event.ruleset', v);
                const rules = rulesets.find((r) => r.value === v)?.rules;
                if (rules) {
                  setFormValues(form.getTransformedValues().event, rules);
                }
              }
            }}
          />
        )}
        <Select
          icon={<IconMap2 size='1rem' />}
          label={i18n._t('Primary timezone for event')}
          description={i18n._t(
            'All dates and time will be displayed according to the selected timezone.'
          )}
          searchable
          nothingFound={i18n._t('Nothing found')}
          maxDropdownHeight={280}
          data={timezones}
          {...form.getInputProps('event.timezone')}
        />
        <Textarea
          label={i18n._t('Brief description')}
          description={i18n._t('Multiline. Markdown syntax supported.')}
          {...form.getInputProps('event.description')}
          autosize
        />
      </Stack>
    </>
  );
};
