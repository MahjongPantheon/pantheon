import { I18nService } from '#/services/i18n';
import * as React from 'react';
import { NumberInput } from '@mantine/core';
import { IconChartHistogram, IconNumbers } from '@tabler/icons-react';
import { FormHandle } from '#/pages/OwnedEventsEdit/types';

type LocalSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const LocalSettings: React.FC<LocalSettingsProps> = ({ form, i18n }) => {
  return (
    <>
      <NumberInput
        {...form.getInputProps('event.gameSeriesCount')}
        icon={<IconChartHistogram size='1rem' />}
        label={i18n._t('Series length')}
        description={i18n._t(
          'Count of session in game series. Set to 0 to disable series functionality.'
        )}
        defaultValue={0}
        step={5}
        min={0}
      />
      <NumberInput
        {...form.getInputProps('event.minGamesCount')}
        icon={<IconNumbers size='1rem' />}
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
