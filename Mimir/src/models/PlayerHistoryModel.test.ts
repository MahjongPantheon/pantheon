import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { Model } from './Model.js';
import { Repository } from 'src/services/Repository.js';
import { PlayerHistoryEntity } from 'src/entities/PlayerHistory.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { init } from 'src/tests/initOrm.js';

const orm = await init();

describe('PlayerHistory', () => {
  const repo = Repository.instance({}, orm);
  const mdl = Model.getModel(repo, PlayerHistoryModel);

  it('should update history item', () => {
    const item = new PlayerHistoryEntity();
    item.playerId = 2;
    item.event = { id: 3 } as EventEntity;
    item.sessionId = 4;
    item.avgPlace = 2.5;
    item.gamesPlayed = 4;
    item.rating = 1500;
    item.chips = 1;
    const modified = mdl.updateAvgPlaceAndGamesCount(item, 2);

    const expected = new PlayerHistoryEntity();
    expected.playerId = 2;
    expected.event = { id: 3 } as EventEntity;
    expected.sessionId = 4;
    expected.avgPlace = 2.4;
    expected.gamesPlayed = 5;
    expected.rating = 1500;
    expected.chips = 1;
    expect(modified).toEqual(expected);
  });

  it('should make new item for session', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.chipsValue = 1;
    const items: Record<number, PlayerHistoryEntity> = {};
    items[5] = new PlayerHistoryEntity();
    items[5].playerId = 5;
    items[5].event = { id: 2 } as EventEntity;
    items[5].sessionId = 3;
    items[5].avgPlace = 2.4;
    items[5].gamesPlayed = 5;
    items[5].rating = 1540;
    items[5].chips = 1;

    items[6] = new PlayerHistoryEntity();
    items[6].playerId = 6;
    items[6].event = { id: 2 } as EventEntity;
    items[6].sessionId = 3;
    items[6].avgPlace = 2.4;
    items[6].gamesPlayed = 5;
    items[6].rating = 1540;
    items[6].chips = 1;

    items[7] = new PlayerHistoryEntity();
    items[7].playerId = 7;
    items[7].event = { id: 2 } as EventEntity;
    items[7].sessionId = 3;
    items[7].avgPlace = 2.4;
    items[7].gamesPlayed = 5;
    items[7].rating = 1540;
    items[7].chips = 1;

    items[8] = new PlayerHistoryEntity();
    items[8].playerId = 8;
    items[8].event = { id: 2 } as EventEntity;
    items[8].sessionId = 3;
    items[8].avgPlace = 2.4;
    items[8].gamesPlayed = 5;
    items[8].rating = 1540;
    items[8].chips = 1;

    const newItems = mdl.makeNewHistoryItemsForSession(items, ruleset, 2, 3, {
      5: { ratingDelta: 10, place: 1, chips: 1 },
      6: { ratingDelta: 5, place: 2, chips: 2 },
      7: { ratingDelta: -5, place: 3, chips: -1 },
      8: { ratingDelta: -10, place: 4, chips: -2 },
    });

    const expected: Record<number, PlayerHistoryEntity> = {};
    expected[5] = new PlayerHistoryEntity();
    expected[5].playerId = 5;
    expected[5].event = { id: 2 } as EventEntity;
    expected[5].sessionId = 3;
    expected[5].avgPlace = 2.1666666666666665;
    expected[5].chips = 2;
    expected[5].gamesPlayed = 6;
    expected[5].rating = 1550;

    expected[6] = new PlayerHistoryEntity();
    expected[6].playerId = 6;
    expected[6].event = { id: 2 } as EventEntity;
    expected[6].sessionId = 3;
    expected[6].avgPlace = 2.3333333333333335;
    expected[6].chips = 3;
    expected[6].gamesPlayed = 6;
    expected[6].rating = 1545;

    expected[7] = new PlayerHistoryEntity();
    expected[7].playerId = 7;
    expected[7].event = { id: 2 } as EventEntity;
    expected[7].sessionId = 3;
    expected[7].avgPlace = 2.5;
    expected[7].chips = 0;
    expected[7].gamesPlayed = 6;
    expected[7].rating = 1535;

    expected[8] = new PlayerHistoryEntity();
    expected[8].playerId = 8;
    expected[8].event = { id: 2 } as EventEntity;
    expected[8].sessionId = 3;
    expected[8].avgPlace = 2.6666666666666665;
    expected[8].chips = -1;
    expected[8].gamesPlayed = 6;
    expected[8].rating = 1530;

    expect(newItems).toEqual(expected);
  });

  it('should make a sum of two history items', () => {
    const ruleset = RulesetEntity.createRuleset('tenhounet');
    ruleset.rules.startRating = 1500;
    const item1 = new PlayerHistoryEntity();
    const item2 = new PlayerHistoryEntity();

    item1.playerId = 7;
    item1.event = { id: 2 } as EventEntity;
    item1.sessionId = 3;
    item1.avgPlace = 2.6;
    item1.chips = 1;
    item1.gamesPlayed = 5;
    item1.rating = 1540;

    item2.playerId = 7;
    item2.event = { id: 2 } as EventEntity;
    item2.sessionId = 3;
    item2.avgPlace = 2.2;
    item2.chips = 1;
    item2.gamesPlayed = 5;
    item2.rating = 1540;

    const expected = new PlayerHistoryEntity();
    expected.playerId = 7;
    expected.event = { id: 2 } as EventEntity;
    expected.sessionId = 3; // TODO: в этом поле нет смысла в данном случае
    expected.avgPlace = 2.4;
    expected.chips = 2;
    expected.gamesPlayed = 10;
    expected.rating = 1580;

    expect(mdl.makeHistoryItemsSum(item1, item2, ruleset)).toEqual(expected);
  });

  it('should make a diff of two history items', () => {
    const ruleset = RulesetEntity.createRuleset('tenhounet');
    ruleset.rules.startRating = 1500;
    const item1 = new PlayerHistoryEntity();
    item1.playerId = 7;
    item1.event = { id: 2 } as EventEntity;
    item1.sessionId = 3;
    item1.avgPlace = 2.6;
    item1.chips = 1;
    item1.gamesPlayed = 5;
    item1.rating = 1540;

    const item2 = new PlayerHistoryEntity();
    item2.playerId = 7;
    item2.event = { id: 2 } as EventEntity;
    item2.sessionId = 3;
    item2.avgPlace = 2.2;
    item2.chips = 1;
    item2.gamesPlayed = 8;
    item2.rating = 1540;

    const expected = new PlayerHistoryEntity();
    expected.playerId = 7;
    expected.event = { id: 2 } as EventEntity;
    expected.sessionId = 3; // TODO: в этом поле нет смысла в данном случае
    expected.avgPlace = 1.5333333333333339;
    expected.chips = 0;
    expected.gamesPlayed = 3;
    expected.rating = 1500;

    expect(mdl.makeHistoryItemsDiff(item2, item1, ruleset)).toEqual(expected);
    expect(mdl.makeHistoryItemsSum(item1, expected, ruleset)).toEqual(item2);
  });
});
