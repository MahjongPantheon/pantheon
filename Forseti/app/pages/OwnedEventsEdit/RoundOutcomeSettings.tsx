import { Checkbox, Select, Title } from '@mantine/core';
import { I18nService } from '../../services/i18n';
import { FormHandle } from './types';

type RoundOutcomeSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const RoundOutcomeSettings = ({ form, i18n }: RoundOutcomeSettingsProps) => {
  const withAbortives = form.useWatchValue('ruleset.withAbortives');
  const allowTripleRonWithAbortives = form.useWatchValue('ruleset.allowTripleRonWithAbortives');
  const abortiveDrawMode = !withAbortives
    ? 'disabled'
    : allowTripleRonWithAbortives
      ? 'exceptTripleRon'
      : 'all';
  return (
    <>
      <Title order={4}>{i18n._t('Round outcomes')}</Title>
      <Checkbox
        label={i18n._t('Atamahane')}
        description={i18n._t(
          'Only first player by the order of the move from the loser would be considered a winner. If not checked, all players declaring Ron are considered winners.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-atamahane'
        key={form.key('ruleset.withAtamahane')}
        {...form.getInputProps('ruleset.withAtamahane', { type: 'checkbox' })}
      />
      <Select
        label={i18n._t('Abortive draws')}
        description={i18n._t(
          'There will be a separate "Abortive draw" outcome to record draws due to four riichi, four kans, suufon renda, kyuushu kyuuhai, etc.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-abortives'
        value={abortiveDrawMode}
        allowDeselect={false}
        data={[
          { value: 'disabled', label: i18n._t('Disabled') },
          { value: 'all', label: i18n._t('All') },
          { value: 'exceptTripleRon', label: i18n._t('All except triple ron') },
        ]}
        onChange={(mode) => {
          if (!mode) return;
          form.setFieldValue('ruleset.withAbortives', mode !== 'disabled');
          form.setFieldValue('ruleset.allowTripleRonWithAbortives', mode === 'exceptTripleRon');
        }}
      />
      <Checkbox
        label={i18n._t('Nagashi mangan')}
        description={i18n._t('Enable "Nagashi" outcome to record this special draw')}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-nagashi-mangan'
        key={form.key('ruleset.withNagashiMangan')}
        {...form.getInputProps('ruleset.withNagashiMangan', { type: 'checkbox' })}
      />
    </>
  );
};
