import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Player, RegisteredPlayer } from 'tsclients/proto/atoms.pb';
import type { RefereeNotesResponse } from 'tsclients/proto/mimir.pb';
import { RefereeNotes } from './RefereeNotes';
import { auth, authCtx, PrivilegesLevel } from '../hooks/auth';
import { actionButtonCtx } from '../hooks/actionButton';

const { api } = vi.hoisted(() => ({
  api: { getRefereeNotes: vi.fn(), getAllPlayers: vi.fn(), addRefereeNote: vi.fn() },
}));
const i18n = { _t: (text: string, args: string[] = []) => text.replace('%1', args[0] ?? '') };
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => i18n }));

let container: HTMLDivElement;
let actions: HTMLDivElement;
let root: Root;
const data = (): RefereeNotesResponse => ({
  notes: [
    {
      id: 3,
      content: 'Shared instructions\nKeep a record',
      authorId: 7,
      createdAt: '2026-11-25T00:00:00Z',
    },
    {
      id: 2,
      content: 'Player observation',
      authorId: 8,
      playerId: 12,
      createdAt: '2026-11-24T00:00:00Z',
    },
  ],
  authors: [
    Player.initialize({ id: 7, title: 'First referee' }),
    Player.initialize({ id: 8, title: 'Second referee' }),
  ],
  players: [Player.initialize({ id: 12, title: 'Linked player' })],
});

beforeEach(() => {
  vi.resetAllMocks();
  api.getRefereeNotes.mockResolvedValue(data());
  api.getAllPlayers.mockResolvedValue([
    RegisteredPlayer.initialize({ id: 12, title: 'Linked player' }),
  ]);
  api.addRefereeNote.mockResolvedValue(true);
  container = document.createElement('div');
  actions = document.createElement('div');
  const content = document.createElement('div');
  container.append(actions, content);
  document.body.append(container);
  root = createRoot(content);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function render(
  options: {
    eventId?: number;
    linkedPlayersOnly?: boolean;
    privilegesLevel?: PrivilegesLevel;
    privilegesLoading?: boolean;
    isLoggedIn?: boolean;
  } = {}
) {
  const { eventId = 42, linkedPlayersOnly = false, ...authOptions } = options;
  await act(async () =>
    root.render(
      <MantineProvider env='test'>
        <authCtx.Provider
          value={{
            ...auth,
            isLoggedIn: true,
            privilegesLevel: PrivilegesLevel.REFEREE,
            ...authOptions,
          }}
        >
          <actionButtonCtx.Provider value={{ current: actions }}>
            <RefereeNotes eventId={eventId} linkedPlayersOnly={linkedPlayersOnly} />
          </actionButtonCtx.Provider>
        </authCtx.Provider>
      </MantineProvider>
    )
  );
}

function type(testId: string, value: string) {
  act(() => {
    const element = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[data-testid="${testId}"]`
    )!;
    const prototype =
      element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function submit() {
  await act(async () => {
    container
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

it('shows shared event notes and player notes with their authors and timestamps', async () => {
  await render();
  expect(api.getRefereeNotes).toHaveBeenCalledExactlyOnceWith(42);
  expect(container.textContent).toContain('Shared instructions');
  expect(container.textContent).toContain('Author: First referee');
  expect(container.textContent).toContain('Linked player');
  expect(container.textContent).toContain('Author: Second referee');
  expect(container.querySelector('time')?.dateTime).toBe('2026-11-25T00:00:00Z');
});

it.each([false, true])('adds a note with an optional registered player: %s', async (linked) => {
  await render();
  type('forseti-referee-note-content', '  Follow up next session  ');
  if (linked) {
    type('forseti-referee-note-player', 'Linked');
    act(() => document.querySelector<HTMLElement>('[role="option"]')!.click());
  }
  await submit();
  expect(api.addRefereeNote).toHaveBeenCalledExactlyOnceWith(
    42,
    'Follow up next session',
    linked ? 12 : undefined
  );
  expect(api.getRefereeNotes).toHaveBeenCalledTimes(2);
  expect(container.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('');
  expect(container.textContent).toContain('Referee note saved');
});

it('disables blank notes and shows only player-linked notes on the penalties page', async () => {
  await render();
  type('forseti-referee-note-content', ' \n ');
  expect(container.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled).toBe(true);
  await render({ linkedPlayersOnly: true });
  expect(container.querySelector('form')).toBeNull();
  expect(container.textContent).not.toContain('Shared instructions');
  expect(container.textContent).toContain('Player observation');
});

it.each([
  { privilegesLevel: PrivilegesLevel.NOBODY },
  { isLoggedIn: false },
  { privilegesLoading: true },
])('does not request private notes without a resolved event role: %j', async (options) => {
  await render(options);
  expect(api.getRefereeNotes).not.toHaveBeenCalled();
  expect(api.getAllPlayers).not.toHaveBeenCalled();
  expect(container.querySelector('form')).toBeNull();
  expect(container.textContent).not.toContain('Shared instructions');
});

it('retains a failed draft and allows a retry', async () => {
  await render();
  api.addRefereeNote.mockRejectedValueOnce(new Error('Save unavailable'));
  type('forseti-referee-note-content', 'Retain this draft');
  await submit();
  expect(container.textContent).toContain('Save unavailable');
  expect(container.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('Retain this draft');
  await submit();
  expect(container.textContent).toContain('Referee note saved');
});

it("keeps an unsaved draft when refreshing other referees' notes", async () => {
  await render();
  type('forseti-referee-note-content', 'Draft in progress');
  type('forseti-referee-note-player', 'Linked');
  act(() => document.querySelector<HTMLElement>('[role="option"]')!.click());
  await act(async () =>
    container.querySelector<HTMLButtonElement>('[data-testid="referee-notes-refresh"]')!.click()
  );
  expect(container.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('Draft in progress');
  await submit();
  expect(api.addRefereeNote).toHaveBeenCalledExactlyOnceWith(42, 'Draft in progress', 12);
});

it('clears a saved draft even when refreshing fails, preventing accidental resubmission', async () => {
  await render();
  type('forseti-referee-note-content', 'Saved note');
  api.getRefereeNotes.mockRejectedValueOnce(new Error('Refresh unavailable'));
  await submit();
  expect(container.textContent).toContain('Refresh unavailable');
  expect(container.textContent).toContain('Referee note saved');
  expect(container.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('');
});

it('reports a false save result without discarding the draft', async () => {
  await render();
  type('forseti-referee-note-content', 'Draft');
  api.addRefereeNote.mockResolvedValueOnce(false);
  await submit();
  expect(container.textContent).toContain('Failed to save referee note');
  expect(container.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('Draft');
});

it('can retry loading and handles empty lists and missing display names', async () => {
  api.getRefereeNotes.mockRejectedValueOnce(new Error('Load unavailable'));
  await render();
  expect(container.textContent).toContain('Load unavailable');
  api.getRefereeNotes.mockResolvedValueOnce({ notes: [], authors: [], players: [] });
  await act(async () => {
    container.querySelector<HTMLButtonElement>('[data-testid="referee-notes-refresh"]')!.click();
  });
  expect(container.textContent).toContain('No referee notes yet');
  api.getRefereeNotes.mockResolvedValueOnce({ notes: data().notes, authors: [], players: [] });
  await render({ linkedPlayersOnly: true });
  expect(container.textContent).toContain('#12');
  expect(container.textContent).toContain('Author: #8');
  api.getRefereeNotes.mockResolvedValueOnce({ notes: [], authors: [], players: [] });
  await act(async () => {
    container.querySelector<HTMLButtonElement>('[data-testid="referee-notes-refresh"]')!.click();
  });
  expect(container.textContent).toContain('No referee notes linked to players yet');
});

it('ignores a delayed response from a previously viewed event', async () => {
  let resolve!: (value: RefereeNotesResponse) => void;
  api.getRefereeNotes.mockReturnValueOnce(
    new Promise<RefereeNotesResponse>((done) => {
      resolve = done;
    })
  );
  await render();
  api.getRefereeNotes.mockResolvedValueOnce({ notes: [], authors: [], players: [] });
  await render({ eventId: 43 });
  await act(async () => resolve(data()));
  expect(container.textContent).not.toContain('Shared instructions');
  expect(container.textContent).toContain('No referee notes yet');
});
