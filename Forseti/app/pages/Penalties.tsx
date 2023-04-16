import * as React from 'react';
import { createRef, useContext, useEffect, useState } from 'react';
import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { usePageTitle } from '#/hooks/pageTitle';
import { GameConfig } from '#/clients/atoms.pb';
import { useForm } from '@mantine/form';
import { Container, LoadingOverlay, NumberInput, Select, TextInput } from '@mantine/core';
import {
  IconAlertOctagon,
  IconCircleCheck,
  IconDeviceFloppy,
  IconSignature,
  IconUserExclamation,
} from '@tabler/icons-react';
import { TopActionButton } from '#/helpers/TopActionButton';
import { notifications } from '@mantine/notifications';
import { nprogress } from '@mantine/nprogress';

export const Penalties: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const formRef: React.RefObject<HTMLFormElement> = createRef();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventConfig, setEventConfig] = useState<null | GameConfig>(null);
  const [playersList, setPlayersList] = useState<Array<{ label: string; value: string }>>([]);
  usePageTitle(i18n._t('Manage penalties'));

  useEffect(() => {
    if (!isLoggedIn || !id) {
      return;
    }
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    Promise.all([api.getGameConfig(parseInt(id, 10)), api.getAllPlayers(parseInt(id, 10))])
      .then(([config, players]) => {
        setEventConfig(config);
        setPlayersList(
          players.map((p) => ({
            value: p.id.toString(),
            label: p.title,
          }))
        );
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        nprogress.complete();
        setIsLoading(false);
      });
  }, [isLoggedIn]);

  const form = useForm({
    initialValues: {
      player: 0,
      amount: 0,
      reason: '',
    },

    validate: {
      player: (value: number) => (value > 0 ? null : i18n._t('Please select player')),
      amount: (value: number) => (value > 0 ? null : i18n._t('Please select penalty amount')),
      reason: (value: string) =>
        value.trim() !== '' ? null : i18n._t('A reason for penalty is mandatory'),
    },
  });

  const submitForm = (vals: { player: number; amount: number; reason: string }) => {
    if (!id) {
      return;
    }
    setIsSaving(true);
    setIsSaved(false);

    api
      .addPenalty(parseInt(id, 10), vals.player, vals.amount, vals.reason)
      .then((r) => {
        if (r) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
          form.reset();
        } else {
          throw new Error(i18n._t('Failed to apply penalty: server error or network unreachable'));
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <form ref={formRef} onSubmit={form.onSubmit(submitForm)}>
      <Container>
        <LoadingOverlay visible={isLoading} overlayOpacity={1} />
        <Select
          withAsterisk
          icon={<IconUserExclamation size='1rem' />}
          label={i18n._t('Select player')}
          searchable
          description={i18n._t('This is a player to be penalized')}
          data={playersList}
          {...form.getInputProps('player')}
        />
        <NumberInput
          withAsterisk
          {...form.getInputProps('amount')}
          icon={<IconAlertOctagon size='1rem' />}
          label={i18n._t('Penalty amount')}
          description={i18n._t(
            'The points you enter here will be subtracted from player score after uma is applied when session ends. Please note: the penalty can be only applied during the session. If session is already ended, apply penalty in the next session.'
          )}
          defaultValue={eventConfig?.rulesetConfig.minPenalty}
          step={eventConfig?.rulesetConfig.penaltyStep}
          min={eventConfig?.rulesetConfig.minPenalty}
          max={eventConfig?.rulesetConfig.maxPenalty}
        />
        <TextInput
          withAsterisk
          icon={<IconSignature size='1rem' />}
          label={i18n._t('Penalty reason')}
          {...form.getInputProps('reason')}
        />
        <TopActionButton
          title={isSaved ? i18n._t('Penalty applied!') : i18n._t('Apply penalty')}
          loading={isSaving}
          disabled={isLoading || isSaved}
          icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
        />
      </Container>
    </form>
  );
};
