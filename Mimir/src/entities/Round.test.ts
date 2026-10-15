import { RoundEntity } from './Round.entity.js';
import { SessionEntity } from './Session.entity.js';
import { EventEntity } from './Event.entity.js';
import { SessionStateEntity } from './SessionState.entity.js';
import { roundFixtures } from '../tests/roundFixtures.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';

describe('Round message conversion', () => {
  it.each(roundFixtures)('preserves %s round details', (kind, message) => {
    const session = Object.assign(new SessionEntity(), { id: 1 });
    const event = Object.assign(new EventEntity(), { id: 2 });
    const state = new SessionStateEntity();
    const entity = RoundEntity.fromMessage(session, event, message, state);
    expect(entity.session).toBe(session);
    expect(entity.event).toBe(event);
    expect(entity.lastSessionState).toBe(state);
    expect(entity.round).toBe(2);
    expect(entity.honba).toBe(1);
    expect(entity.riichi).toEqual(kind === 'chombo' ? [] : [2]);
    expect(entity.hands).toHaveLength(kind === 'multiron' ? 2 : 1);
    expect(Number.isNaN(Date.parse(entity.endDate!))).toBe(false);
    const converted = RoundEntity.toMessage(entity);
    expect(converted).toMatchObject({
      [kind]: expect.objectContaining({ roundIndex: 2, honba: 1 }),
    });
    if (kind === 'multiron') {
      expect(converted.multiron?.wins.map((hand) => hand.winnerId)).toEqual([2, 4]);
      expect(converted.multiron?.riichiBets).toEqual([2]);
    } else {
      expect(converted).toMatchObject(message);
    }
  });

  it('uses empty arrays for missing optional collections', () => {
    const entity = RoundEntity.fromMessage(
      new SessionEntity(),
      new EventEntity(),
      roundFixtures[0][1]
    );
    entity.riichi = undefined;
    entity.hands[0].yaku = undefined;
    expect(RoundEntity.toMessage(entity).ron).toMatchObject({ riichiBets: [], yaku: [] });
  });

  it('returns an empty message for an unrecognized outcome', () => {
    const entity = new RoundEntity();
    entity.outcome = RoundOutcome.ROUND_OUTCOME_UNSPECIFIED;
    expect(RoundEntity.toMessage(entity)).toEqual({});
  });
});
