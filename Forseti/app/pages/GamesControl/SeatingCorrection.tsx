import { useRef, useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { IconArrowsExchange } from '@tabler/icons-react';
import type { GamesGetSessionOverviewResponse } from 'tsclients/proto/mimir.pb';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';

const winds = ['east', 'south', 'west', 'north'] as const;

export function SeatingCorrection({
  sessionHash,
  onCorrected,
}: {
  sessionHash: string;
  onCorrected: () => Promise<unknown>;
}) {
  const api = useApi();
  const i18n = useI18n();
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [overview, setOverview] = useState<GamesGetSessionOverviewResponse | null>(null);
  const [seats, setSeats] = useState<number[]>([]);
  const [error, setError] = useState('');
  const testId = `forseti-game-correct-seating-${sessionHash}`;

  function showError(cause: unknown) {
    const failure = cause as { msg?: string; message?: string } | null;
    setError(failure?.msg ?? failure?.message ?? i18n._t('Failed to correct seating'));
  }

  async function open() {
    if (pending.current) return;
    pending.current = true;
    setOpened(true);
    setBusy(true);
    setError('');
    setOverview(null);
    try {
      const fresh = await api.getSessionOverview(sessionHash);
      setOverview(fresh);
      setSeats(fresh.players.map((player) => player.id));
    } catch (err) {
      showError(err);
    } finally {
      setBusy(false);
      pending.current = false;
    }
  }

  async function save() {
    if (pending.current || !overview?.nextRoundToken) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      if (!(await api.correctSessionSeating(sessionHash, seats, overview.nextRoundToken))) {
        throw new Error(i18n._t('Failed to correct seating'));
      }
      setOverview(null);
      setOpened(false);
      await onCorrected();
    } catch (err) {
      showError(err);
    } finally {
      setBusy(false);
      pending.current = false;
    }
  }

  return (
    <>
      <Button data-testid={`${testId}-open`} leftSection={<IconArrowsExchange />} onClick={open}>
        {i18n._t('Correct seating')}
      </Button>
      <Modal
        opened={opened}
        onClose={() => !busy && setOpened(false)}
        title={i18n._t('Correct starting winds')}
        closeOnClickOutside={!busy}
        closeOnEscape={!busy}
        withCloseButton={!busy}
      >
        <Stack>
          <Text>
            {i18n._t(
              'Recorded outcomes stay attached to the named players. Scores and round progression will be recalculated using these starting winds.'
            )}
          </Text>
          {error && <Alert color='red'>{error}</Alert>}
          {overview &&
            seats.map((id, index) => (
              <Select
                key={winds[index]}
                data-testid={`${testId}-seat-${index}`}
                label={
                  [i18n._t('East'), i18n._t('South'), i18n._t('West'), i18n._t('North')][index]
                }
                value={String(id)}
                disabled={busy}
                allowDeselect={false}
                data={overview.players.map((player) => ({
                  value: String(player.id),
                  label: player.title,
                }))}
                onChange={(value) => {
                  if (!value) return;
                  const replacement = Number(value);
                  setSeats((previous) =>
                    previous.map((player, seat) =>
                      seat === index
                        ? replacement
                        : player === replacement
                          ? previous[index]
                          : player
                    )
                  );
                }}
              />
            ))}
          <Group justify='flex-end'>
            <Button variant='default' disabled={busy} onClick={() => setOpened(false)}>
              {i18n._t('Cancel')}
            </Button>
            <Button
              data-testid={`${testId}-confirm`}
              loading={busy}
              disabled={!overview?.nextRoundToken}
              onClick={save}
            >
              {i18n._t('Correct seating')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
