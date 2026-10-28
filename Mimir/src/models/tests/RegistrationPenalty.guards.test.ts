import { Model } from '../Model.js';
import { PlayerModel } from '../PlayerModel.js';
import { EventModel } from '../EventModel.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { PenaltyModel } from '../PenaltyModel.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { PenaltyEntity } from '../../entities/Penalty.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import type { Repository } from '../../services/Repository.js';
import { TournamentGamesStatus } from 'tsclients/proto/atoms.pb.js';

function fixture(personId: number | null = 7) {
  const event: EventEntity = Object.assign(new EventEntity(), {
    id: 42,
    allowPlayerAppend: 1,
    usePenalty: 1,
    ruleset: RulesetEntity.createRuleset('ema'),
  });
  const registration = Object.assign(new EventRegisteredPlayersEntity(), {
    event,
    playerId: 1,
    ignoreSeating: 0,
  });
  const penalty = Object.assign(new PenaltyEntity(), { event, id: 9, playerId: 1, amount: 500 });
  const em = {
    transactional: vi.fn((work: () => Promise<unknown>) => work()),
    findOne: vi.fn().mockResolvedValue(event),
    findOneOrFail: vi.fn().mockResolvedValue(event),
    findAll: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    persist: vi.fn(),
    remove: vi.fn(),
    getReference: vi.fn((_type, id: number) => ({ id })),
    upsertMany: vi.fn(),
  };
  const skirnir = { messagePenaltyCancelled: vi.fn(), messagePenaltyApplied: vi.fn() };
  const repo = { em, skirnir, meta: { personId } } as unknown as Repository;
  const player = Model.getModel(repo, PlayerModel);
  const events = Model.getModel(repo, EventModel);
  const regs = Model.getModel(repo, EventRegistrationModel);
  const penalties = Model.getModel(repo, PenaltyModel);
  vi.spyOn(player, 'isEventAdmin').mockResolvedValue(false);
  vi.spyOn(player, 'isEventReferee').mockResolvedValue(false);
  vi.spyOn(events, 'findById').mockResolvedValue([event]);
  vi.spyOn(regs, 'findByPlayerAndEvent').mockResolvedValue([registration]);
  return { event, registration, penalty, em, skirnir, player, events, regs, penalties };
}
afterEach(() => vi.restoreAllMocks());

it.each([null, 7])(
  'rejects unauthorized player and penalty mutations for caller %s',
  async (id) => {
    const f = fixture(id);
    const operations = [
      () => f.regs.registerPlayer(42, 1),
      () => f.regs.unregisterPlayer(42, 1),
      () => f.regs.updatePlayerSeatingFlag({ eventId: 42, playerId: 1, ignoreSeating: true }),
      () => f.regs.updatePlayersLocalIds({ eventId: 42, idsToLocalIds: [] }),
      () => f.regs.updatePlayerReplacement({ eventId: 42, playerId: 1, replacementId: 2 }),
      () => f.regs.updatePlayersTeams({ eventId: 42, idsToTeamNames: [] }),
      () => f.penalties.addPenalty({ eventId: 42, playerId: 1, amount: 500, reason: 'Late' }),
      () => f.penalties.addPenaltyGame({ eventId: 42, players: [1, 2, 3, 4] }),
      () => f.penalties.listPenalties(42),
      () => f.penalties.listChombo(42),
    ];
    for (const operation of operations) await expect(operation()).rejects.toThrow('permissions');
    f.em.findOne.mockResolvedValueOnce(f.penalty);
    await expect(f.penalties.cancelPenalty({ penaltyId: 9, reason: 'Corrected' })).rejects.toThrow(
      'permissions'
    );
    expect(f.em.persist).not.toHaveBeenCalled();
    expect(f.em.remove).not.toHaveBeenCalled();
  }
);

it('rejects duplicate registrations, missing events and late tournament sign-ups', async () => {
  const f = fixture();
  vi.mocked(f.player.isEventAdmin).mockResolvedValue(true);
  await expect(f.regs.registerPlayer(42, 1)).rejects.toThrow('already registered');
  vi.mocked(f.regs.findByPlayerAndEvent).mockResolvedValue([]);
  f.em.findOne.mockResolvedValueOnce(null);
  await expect(f.regs.registerPlayer(42, 1)).rejects.toThrow('not found');
  f.event.allowPlayerAppend = 0;
  f.em.count.mockResolvedValueOnce(1);
  await expect(f.regs.registerPlayer(42, 1)).rejects.toThrow('already started');
  f.event.isPrescripted = 1;
  vi.spyOn(f.regs, 'findNextFreeLocalId').mockResolvedValue(5);
  expect(await f.regs.registerPlayer(42, 1)).toEqual({ success: true });
  expect(f.em.persist).toHaveBeenCalledWith(expect.objectContaining({ playerId: 1, localId: 5 }));
});

it('rejects edits of unknown registrations and locks seating during active tournament play', async () => {
  const f = fixture();
  vi.mocked(f.player.isEventAdmin).mockResolvedValue(true);
  vi.mocked(f.regs.findByPlayerAndEvent).mockResolvedValueOnce([]);
  await expect(f.regs.unregisterPlayer(42, 1)).rejects.toThrow('not registered');
  vi.mocked(f.regs.findByPlayerAndEvent).mockResolvedValueOnce([]);
  await expect(
    f.regs.updatePlayerSeatingFlag({ eventId: 42, playerId: 1, ignoreSeating: true })
  ).rejects.toThrow('not registered');
  vi.mocked(f.regs.findByPlayerAndEvent).mockResolvedValueOnce([]);
  await expect(
    f.regs.updatePlayerReplacement({ eventId: 42, playerId: 1, replacementId: 2 })
  ).rejects.toThrow('not registered');
  f.event.syncStart = 1;
  f.event.isOnline = 0;
  f.event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY;
  await expect(
    f.regs.updatePlayerSeatingFlag({ eventId: 42, playerId: 1, ignoreSeating: true })
  ).rejects.toThrow('still in progress');
  f.event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED;
  f.em.count.mockResolvedValueOnce(1);
  await expect(
    f.regs.updatePlayerSeatingFlag({ eventId: 42, playerId: 1, ignoreSeating: true })
  ).rejects.toThrow('still in progress');
  for (const ignoreSeating of [false, true]) {
    expect(
      await f.regs.updatePlayerSeatingFlag({ eventId: 42, playerId: 1, ignoreSeating })
    ).toEqual({ success: true });
    expect(f.registration.ignoreSeating).toBe(ignoreSeating ? 1 : 0);
  }
});

it('lets referees assign and remove replacements without changing other registration data', async () => {
  const f = fixture();
  vi.mocked(f.player.isEventReferee).mockResolvedValue(true);
  await f.regs.updatePlayerReplacement({ eventId: 42, playerId: 1, replacementId: 2 });
  expect(f.registration.replacementId).toBe(2);
  await f.regs.updatePlayerReplacement({ eventId: 42, playerId: 1, replacementId: -1 });
  expect(f.registration.replacementId).toBeUndefined();
});

it('rejects missing penalty resources and normalizes an omitted cancellation reason', async () => {
  const f = fixture();
  vi.mocked(f.player.isEventAdmin).mockResolvedValue(true);
  f.em.findOne.mockResolvedValueOnce(null);
  await expect(f.penalties.cancelPenalty({ penaltyId: 9, reason: '' })).rejects.toThrow(
    'Penalty not found'
  );
  f.em.findOne.mockResolvedValueOnce(f.penalty);
  await f.penalties.cancelPenalty({ penaltyId: 9, reason: null });
  expect(f.penalty.cancelled).toBe(1);
  expect(f.skirnir.messagePenaltyCancelled).toHaveBeenCalledWith(1, 42, 500, '');
  await expect(f.penalties.listMyPenalties(42, null)).rejects.toThrow('Unauthorized');
  vi.mocked(f.events.findById).mockResolvedValueOnce([]);
  await expect(
    f.penalties.addPenalty({ eventId: 42, playerId: 1, amount: 500, reason: 'Late' })
  ).rejects.toThrow('Event not found');
  f.event.usePenalty = 0;
  await expect(
    f.penalties.addPenalty({ eventId: 42, playerId: 1, amount: 500, reason: 'Late' })
  ).rejects.toThrow('not enabled');
  f.event.usePenalty = 1;
  vi.spyOn(f.player, 'findById').mockResolvedValue([]);
  await expect(
    f.penalties.addPenalty({ eventId: 42, playerId: 1, amount: 500, reason: 'Late' })
  ).rejects.toThrow('Player not found');
  await expect(f.penalties.addPenaltyGame({ eventId: 42, players: [1, 2, 3, 4] })).rejects.toThrow(
    'Some players'
  );
});
