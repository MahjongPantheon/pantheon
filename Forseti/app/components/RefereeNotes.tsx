import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Group, Paper, Select, Stack, Text, Textarea } from '@mantine/core';
import type { RefereeNotesResponse } from 'tsclients/proto/mimir.pb';
import type { RegisteredPlayer } from 'tsclients/proto/atoms.pb';
import { authCtx, PrivilegesLevel } from '../hooks/auth';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { TopActionButton } from './TopActionButton';
import { IconRefresh } from '@tabler/icons-react';

export const RefereeNotes = ({
  eventId,
  linkedPlayersOnly = false,
}: {
  eventId: number;
  linkedPlayersOnly?: boolean;
}) => {
  const api = useApi();
  const i18n = useI18n();
  const { isLoggedIn, privilegesLevel, privilegesLoading } = useContext(authCtx);
  const canRead = isLoggedIn && privilegesLevel >= PrivilegesLevel.REFEREE;
  const [data, setData] = useState<RefereeNotesResponse | null>(null);
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);
  const [content, setContent] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setPlayers([]);
    setSaved(false);
    setError('');
    if (!canRead || privilegesLoading) return;
    setLoading(true);
    Promise.all([
      api.getRefereeNotes(eventId),
      linkedPlayersOnly ? Promise.resolve([]) : api.getAllPlayers(eventId),
    ])
      .then(([notes, registeredPlayers]) => {
        if (cancelled) return;
        setData(notes);
        setPlayers(registeredPlayers);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api, eventId, canRead, privilegesLoading, linkedPlayersOnly, refresh]);

  if (privilegesLoading) return null;
  if (!canRead) {
    return (
      <Text>{i18n._t('Referee notes are available to event referees and administrators.')}</Text>
    );
  }

  const notes = data?.notes.filter((note) => !linkedPlayersOnly || note.playerId) ?? [];
  const people = new Map(
    [...(data?.authors ?? []), ...(data?.players ?? [])].map((p) => [p.id, p])
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const success = await api.addRefereeNote(
        eventId,
        content.trim(),
        playerId ? Number(playerId) : undefined
      );
      if (!success) throw new Error(i18n._t('Failed to save referee note'));
      setContent('');
      setPlayerId(null);
      setSaved(true);
      setData(await api.getRefereeNotes(eventId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack data-testid='forseti-referee-notes'>
      <Group justify='space-between'>
        <TopActionButton
          testId='referee-notes-refresh'
          icon={<IconRefresh />}
          color='green'
          onClick={() => setRefresh((value) => value + 1)}
          disabled={saving}
          loading={loading}
          title={i18n._t('Refresh notes')}
        />
      </Group>
      {error && <Alert color='red'>{error}</Alert>}
      {!linkedPlayersOnly && (
        <form onSubmit={submit}>
          <Stack>
            <Textarea
              data-testid='forseti-referee-note-content'
              label={i18n._t('Note')}
              description={i18n._t('Visible only to event referees and administrators.')}
              required
              minRows={3}
              maxLength={5000}
              value={content}
              onChange={(event) => setContent(event.currentTarget.value)}
              disabled={loading || saving}
            />
            <Select
              data-testid='forseti-referee-note-player'
              label={i18n._t('Linked player (optional)')}
              description={i18n._t('Leave empty for an event-wide note.')}
              searchable
              clearable
              data={players.map((player) => ({ value: String(player.id), label: player.title }))}
              value={playerId}
              onChange={setPlayerId}
              disabled={loading || saving}
            />
            <Button
              data-testid='forseti-referee-note-submit'
              type='submit'
              disabled={loading || !content.trim()}
              loading={saving}
              style={{ alignSelf: 'flex-end' }}
            >
              {i18n._t('Add referee note')}
            </Button>
            {saved && <Text role='status'>{i18n._t('Referee note saved')}</Text>}
          </Stack>
        </form>
      )}
      {!loading && data && notes.length === 0 && (
        <Text>
          {linkedPlayersOnly
            ? i18n._t('No referee notes linked to players yet')
            : i18n._t('No referee notes yet')}
        </Text>
      )}
      {notes.map((note) => (
        <Paper key={note.id} withBorder p='sm' data-testid={`forseti-referee-note-${note.id}`}>
          <Stack gap='xs'>
            <Text fw={600}>
              {note.playerId
                ? (people.get(note.playerId)?.title ?? `#${note.playerId}`)
                : i18n._t('Event-wide note')}
            </Text>
            <Text style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{note.content}</Text>
            <Group gap='xs'>
              <Text size='sm'>
                {i18n._t('Author: %1', [people.get(note.authorId)?.title ?? `#${note.authorId}`])}
              </Text>
              <Text size='sm' c='dimmed' component='time' dateTime={note.createdAt}>
                {new Date(note.createdAt).toLocaleString()}
              </Text>
            </Group>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
