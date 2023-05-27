import * as React from 'react';
import { Checkbox, NumberInput, Radio, Space, Stack } from '@mantine/core';
import { IconClockPlay, IconUserX } from '@tabler/icons-react';
import { EndingPolicy, GameConfig } from '../../clients/proto/atoms.pb';
import { I18nService } from '../../services/i18n';

type TournamentSettingsProps = {
  config: GameConfig;
  i18n: I18nService;
};

export const TournamentSettings: React.FC<TournamentSettingsProps> = ({ config, i18n }) => {
  return (
    <>
      <NumberInput
        hideControls
        icon={<IconClockPlay size='1rem' />}
        label={i18n._t('Session duration in minutes')}
        description={i18n._t(
          'Timer starting value. After time runs out, session ending policy is applied (see below).'
        )}
        value={config.gameDuration}
        onChange={() => {}}
      />
      <Radio.Group
        label={i18n._t('Session ending policy')}
        description={i18n._t('How game sessions should end during the tournament')}
        value={config.rulesetConfig.endingPolicy}
        onChange={() => {}}
      >
        <Space h='md' />
        <Stack spacing='xs'>
          <Radio
            value={EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED}
            label={i18n._t('Do not interrupt session until it ends')}
          />
          <Radio
            value={EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND}
            label={i18n._t('When time is out, finish current hand and interrupt the session')}
          />
          <Radio
            value={EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND}
            label={i18n._t(
              'When time is out, finish current hand, play one more, and then interrup the session'
            )}
          />
        </Stack>
        <Space h='md' />
      </Radio.Group>
      <Checkbox label={i18n._t('Team tournament')} checked={config.isTeam} onChange={() => {}} />
      <Checkbox
        label={i18n._t('Seating is defined in advance')}
        description={i18n._t(
          'You should prepare the tournament script yourself. No automated seating functionality is available when this flag is set.'
        )}
        checked={config.isPrescripted}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconUserX size='1rem' />}
        label={i18n._t('Fixed score applied to replacement player')}
        description={i18n._t(
          'Fixed amount of result score applied for each replacement player regardless of session results.'
        )}
        value={config.rulesetConfig.replacementPlayerFixedPoints}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconUserX size='1rem' />}
        label={i18n._t('Fixed uma for replacement player')}
        description={i18n._t(
          'Fixed amount of rank penalty applied for each replacement player regardless of session results.'
        )}
        value={config.rulesetConfig.replacementPlayerOverrideUma}
        onChange={() => {}}
      />
    </>
  );
};
