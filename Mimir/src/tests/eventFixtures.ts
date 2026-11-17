import { EntityManager } from '@mikro-orm/core';
import { EventEntity } from '../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../entities/EventRegisteredPlayers.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { Repository } from '../services/Repository.js';
import { init } from './initOrm.js';

export const makeEvent = (em: EntityManager) => {
  const event = new EventEntity();
  event.title = 'title';
  event.timezone = 'UTC';
  event.description = 'desc';
  event.lobbyId = 0;
  event.isOnline = 1;
  event.isTeam = 0;
  event.syncStart = 0;
  event.syncEnd = 0;
  event.autoSeating = 0;
  event.useTimer = 0;
  event.usePenalty = 0;
  event.allowPlayerAppend = 1;
  event.statHost = '';
  event.seriesLength = 0;
  event.hideResults = 0;
  event.hideAchievements = 0;
  event.isPrescripted = 0;
  event.minGamesCount = 0;
  event.finished = 0;
  event.isListed = 1;
  event.allowViewOtherTables = 1;
  event.allowManualAddReplay = 1;
  event.ruleset = RulesetEntity.createRuleset('tenhounet');
  em.persist(event);
  return event;
};

export const makeRegs = (em: EntityManager, event: EventEntity) => {
  const regs = [];
  for (const p of [1, 2, 3, 4]) {
    const reg = new EventRegisteredPlayersEntity();
    reg.playerId = p;
    reg.event = event;
    reg.ignoreSeating = 0;
    em.persist(reg);
    regs.push(reg);
  }
  return regs;
};

export const makeRepo = async () => {
  const orm = await init();
  await orm.schema.create();
  const repo = Repository.instance({}, orm);
  await repo.cache.connect();
  repo.mockFrey();
  return repo;
};

export const prepareTestEntities = async () => {
  const repo = await makeRepo();
  const event = makeEvent(repo.em);
  const regs = makeRegs(repo.em, event);
  await repo.em.flush();
  return [repo, event, regs] as const;
};
