import { ConfigService } from './services/Config.js';
import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AchievementsEntity } from './entities/Achievements.entity.js';
import { EventEntity } from './entities/Event.entity.js';
import { EventPrescriptEntity } from './entities/EventPrescript.entity.js';
import { EventRegisteredPlayersEntity } from './entities/EventRegisteredPlayers.entity.js';
import { HandEntity } from './entities/Hand.entity.js';
import { JobsQueueEntity } from './entities/JobsQueue.entity.js';
import { PenaltyEntity } from './entities/Penalty.entity.js';
import { RefereeNoteEntity } from './entities/RefereeNote.entity.js';
import { PlayerHistoryEntity } from './entities/PlayerHistory.entity.js';
import { PlayerStatsEntity } from './entities/PlayerStats.entity.js';
import { RoundEntity } from './entities/Round.entity.js';
import { RpcOperationEntity } from './entities/RpcOperation.entity.js';
import { RulesetEntity } from './entities/Ruleset.entity.js';
import { SessionEntity } from './entities/Session.entity.js';
import { SessionPlayerEntity } from './entities/SessionPlayer.entity.js';
import { SessionResultsEntity } from './entities/SessionResults.entity.js';
import { SessionStateEntity } from './entities/SessionState.entity.js';

const config = new ConfigService();

export const createBaseConfig = () =>
  ({
    driver: PostgreSqlDriver,
    dbName: config.test ? 'mimir2_unit' : config.db.dbname,
    user: config.db.username,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    implicitTransactions: false,
    // Keep discovery and model queries on the same entity classes in the bundled server.
    entities: [
      AchievementsEntity,
      EventEntity,
      EventPrescriptEntity,
      EventRegisteredPlayersEntity,
      HandEntity,
      JobsQueueEntity,
      PenaltyEntity,
      RefereeNoteEntity,
      PlayerHistoryEntity,
      PlayerStatsEntity,
      RoundEntity,
      RpcOperationEntity,
      RulesetEntity,
      SessionEntity,
      SessionPlayerEntity,
      SessionResultsEntity,
      SessionStateEntity,
    ],
    // enable debug mode to log SQL queries and discovery information
    debug: false,
    dynamicImportProvider: (id: string) => import(id),
  }) satisfies Parameters<typeof defineConfig>[0];
