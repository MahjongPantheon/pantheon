import * as React from 'react';
import { NumberInput, TextInput } from '@mantine/core';
import {
  IconChartHistogram,
  IconCoins,
  IconHourglass,
  IconNumbers,
  IconUsers,
  IconUserX,
} from '@tabler/icons-react';
import { GameConfig } from '../../clients/proto/atoms.pb';
import { I18nService } from '../../services/i18n';

type OnlineSettingsProps = {
  config: GameConfig;
  i18n: I18nService;
};

export const OnlineSettings: React.FC<OnlineSettingsProps> = ({ config, i18n }) => {
  return (
    <>
      <TextInput
        icon={<IconUsers size='1rem' />}
        label={i18n._t(
          'Tenhou Lobby ID. Please contact event administrator for proper link to lobby.'
        )}
        value={config.lobbyId}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconHourglass size='1rem' />}
        label={i18n._t('Game expiration time (in hours)')}
        description={i18n._t(
          'Interval of time when played online game is still considered valid and can be added to the rating.'
        )}
        value={config.rulesetConfig.gameExpirationTime}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconCoins size='1rem' />}
        label={i18n._t('Chips value')}
        description={i18n._t(
          'Amount of points given for each chip. Chips should be set up in tournament settings in Tenhou.net.'
        )}
        value={config.rulesetConfig.chipsValue}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconChartHistogram size='1rem' />}
        label={i18n._t('Series length')}
        description={i18n._t('Count of session in game series.')}
        value={config.seriesLength}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconNumbers size='1rem' />}
        label={i18n._t('Minimal games count')}
        description={i18n._t(
          'Minimal count of games the player should play to get into the rating table.'
        )}
        value={config.minGamesCount}
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
