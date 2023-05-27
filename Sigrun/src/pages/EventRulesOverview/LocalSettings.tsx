import * as React from 'react';
import { NumberInput } from '@mantine/core';
import { IconChartHistogram, IconNumbers } from '@tabler/icons-react';
import { GameConfig } from '../../clients/proto/atoms.pb';
import { I18nService } from '../../services/i18n';

type LocalSettingsProps = {
  config: GameConfig;
  i18n: I18nService;
};

export const LocalSettings: React.FC<LocalSettingsProps> = ({ config, i18n }) => {
  return (
    <>
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
    </>
  );
};
