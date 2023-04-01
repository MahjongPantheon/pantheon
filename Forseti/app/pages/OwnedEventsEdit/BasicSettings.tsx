import { I18nService } from '#/services/i18n';
import * as React from 'react';
import { Text, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { IconAbc, IconMap2 } from '@tabler/icons-react';
import { FormHandle } from '#/pages/OwnedEventsEdit/types';

type BasicSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
  timezones: Array<{ value: string; label: string }>;
};

export const BasicSettings: React.FC<BasicSettingsProps> = ({ timezones, form, i18n }) => {
  return (
    <>
      <Stack>
        <Text>Type: {form.getTransformedValues().event.type}</Text>
        {/*<Radio.Group*/}
        {/*  label={i18n._t('Select event type')}*/}
        {/*  {...form.getInputProps('event.type')}*/}
        {/*  onChange={(v) => {*/}
        {/*    setEventType(v as EventType);*/}
        {/*    form.setFieldValue('event.type', v as EventType);*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <Group mt='xs'>*/}
        {/*    <Radio value='local' label={i18n._t('Local rating')} />*/}
        {/*    <Radio value='tournament' label={i18n._t('Tournament')} />*/}
        {/*    <Radio value='online' label={i18n._t('Online event')} />*/}
        {/*  </Group>*/}
        {/*</Radio.Group>*/}
        <TextInput
          withAsterisk
          icon={<IconAbc size='1rem' />}
          label={i18n._t('Event title')}
          {...form.getInputProps('event.title')}
        />
        {/*<Select*/}
        {/*  icon={<IconChecklist size='1rem' />}*/}
        {/*  label={i18n._t('Basic ruleset')}*/}
        {/*  description={i18n._t(*/}
        {/*    'Basic ruleset for the event. Fine tuning is available in adjacent tabs.'*/}
        {/*  )}*/}
        {/*  data={rulesets}*/}
        {/*  {...form.getInputProps('event.ruleset')}*/}
        {/*  onChange={(v) => {*/}
        {/*    if (v) {*/}
        {/*      setRulesetValues(v);*/}
        {/*      form.setFieldValue('event.ruleset', v);*/}
        {/*    }*/}
        {/*  }}*/}
        {/*/>*/}
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
