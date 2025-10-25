import { Kysely, PostgresDialect } from 'kysely';
import { ConfigService } from './Config';
import { Database } from 'database/schema';
import { Pool } from 'pg';
import { LogService } from './Log';

export class DatabaseService {
  protected _db: Kysely<Database>;

  public constructor(config: ConfigService, logService: LogService) {
    this._db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({
          database: config.test ? 'mimir2_unit' : config.db.dbname,
          host: config.db.host,
          user: config.db.username,
          password: config.db.password,
          port: config.db.port,
          max: 10,
        }),
      }),
      log: (event) => {
        if (
          !config.development ||
          (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE !== 'true')
        ) {
          return;
        }
        if (event.level === 'error') {
          logService.error('Query failed : ', {
            durationMs: event.queryDurationMillis,
            error: event.error,
            sql: event.query.sql,
            params: event.query.parameters,
          });
        } else {
          // `'query'`
          logService.info('Query executed : ', {
            durationMs: event.queryDurationMillis,
            sql: event.query.sql,
            params: event.query.parameters,
          });
        }
      },
    });
  }

  get client(): Kysely<Database> {
    return this._db;
  }
}
