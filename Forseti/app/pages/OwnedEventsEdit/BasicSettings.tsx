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
import { EventType, RulesetConfig } from 'tsclients/proto/atoms.pb';

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
  const eventType = form.useWatchValue('event.type');
  const typeMap: Record<EventType, string> = {
    [EventType.EVENT_TYPE_UNSPECIFIED]: '',
    [EventType.EVENT_TYPE_LOCAL]: i18n._t('Local rating'),
    [EventType.EVENT_TYPE_ONLINE]: i18n._t('Online event'),
    [EventType.EVENT_TYPE_TOURNAMENT]: i18n._t('Tournament'),
  };
  return (
    <>
      <Stack>
        {!newEvent && <Text>Type: {typeMap[eventType ?? EventType.EVENT_TYPE_LOCAL]}</Text>}
        {newEvent && (
          <>
            <Radio.Group
              data-testid='forseti-event-settings-basic-settings-event-type'
              label={i18n._t('Select event type')}
              key={form.key('event.type')}
              {...form.getInputProps('event.type')}
              onChange={(value) => {
                form.setFieldValue('event.type', value as EventType);
                form.setFieldValue(
                  'ruleset.useAggregatedYakuhai',
                  value === EventType.EVENT_TYPE_TOURNAMENT
                );
              }}
            >
              <Group mt='xs'>
                {(Object.keys(typeMap) as EventType[])
                  .filter((v) => v !== EventType.EVENT_TYPE_UNSPECIFIED)
                  .map((k, idx) => (
                    <Radio
                      data-testid={`forseti-event-settings-event-type-${k}`}
                      key={`rad_${idx}`}
                      value={k}
                      label={typeMap[k]}
                    />
                  ))}
              </Group>
            </Radio.Group>
          </>
        )}
        <TextInput
          withAsterisk
          leftSection={<IconAbc size='1rem' />}
          label={i18n._t('Event title')}
          description={i18n._t(
            'Please include a "TEST" word if you make a test tournament. Events that have "TEST" in title do not send any notifications to players.'
          )}
          data-testid='forseti-event-settings-basic-settings-event-title'
          key={form.key('event.title')}
          {...form.getInputProps('event.title')}
        />
        {newEvent && (
          <Select
            leftSection={<IconChecklist size='1rem' />}
            label={i18n._t('Basic ruleset')}
            description={i18n._t(
              'Ruleset to be used as a template for the event. Fine tuning is available in adjacent tabs. Please note that all ruleset settings will be reset when you select another ruleset here.'
            )}
            data={rulesets}
            data-testid='forseti-event-settings-basic-settings-event-ruleset'
            key={form.key('event.ruleset')}
            {...form.getInputProps('event.ruleset')}
            onChange={(v) => {
              if (v) {
                form.setFieldValue('event.ruleset', v);
                const rules = rulesets.find((r) => r.value === v)?.rules;
                if (rules) {
                  setFormValues(form.getTransformedValues().event, {
                    ...rules,
                    useAggregatedYakuhai: form.getValues().ruleset.useAggregatedYakuhai,
                  });
                }
              }
            }}
          />
        )}
        <Select
          leftSection={<IconMap2 size='1rem' />}
          label={i18n._t('Primary timezone for event')}
          description={i18n._t(
            'All dates and time will be displayed according to the selected timezone.'
          )}
          searchable
          nothingFoundMessage={i18n._t('Nothing found')}
          maxDropdownHeight={280}
          limit={50}
          data={timezones}
          data-testid='forseti-event-settings-basic-settings-event-timezone'
          key={form.key('event.timezone')}
          {...form.getInputProps('event.timezone')}
        />
        <Textarea
          label={i18n._t('Brief description')}
          description={i18n._t('Multiline. Markdown syntax supported.')}
          data-testid='forseti-event-settings-basic-settings-event-description'
          key={form.key('event.description')}
          {...form.getInputProps('event.description')}
          autosize
        />
        <Checkbox
          label={i18n._t('Show in ratings global list')}
          description={i18n._t(
            'If checked, the event will be publicly visible on main page of ratings subsystem. If unchecked, event will not be visible in the list, but still will be accessible via particular link'
          )}
          data-testid='forseti-event-settings-basic-settings-event-is-listed'
          key={form.key('event.isListed')}
          {...form.getInputProps('event.isListed', { type: 'checkbox' })}
        />
        <Checkbox
          label={i18n._t('Show rating table for everyone')}
          description={i18n._t(
            'If checked, the rating table will be shown for everyone, otherwise only for event administrators'
          )}
          data-testid='forseti-event-settings-basic-settings-event-is-rating-shown'
          key={form.key('event.isRatingShown')}
          {...form.getInputProps('event.isRatingShown', { type: 'checkbox' })}
        />
        <Checkbox
          label={i18n._t('Show achievements for everyone')}
          description={i18n._t(
            'If checked, achievements will be shown for everyone, otherwise only for event administrators'
          )}
          data-testid='forseti-event-settings-basic-settings-event-achievements-shown'
          key={form.key('event.achievementsShown')}
          {...form.getInputProps('event.achievementsShown', { type: 'checkbox' })}
        />
        <Checkbox
          label={i18n._t('Allow viewing of other tables during ongoing game')}
          description={i18n._t(
            'If checked, players will be able to see other tables state even if they are currently in game. It is strongly recommended to keep this checkbox disabled for all tournament events.'
          )}
          data-testid='forseti-event-settings-basic-settings-event-allow-view-other-tables'
          key={form.key('event.allowViewOtherTables')}
          {...form.getInputProps('event.allowViewOtherTables', { type: 'checkbox' })}
        />
      </Stack>
    </>
  );
};
