import { ConfigService } from './Config.js';
import { createSimpleLogger, Logger } from 'simple-node-logger';

export class LogService {
  protected _logger: Logger;
  constructor(protected config: ConfigService) {
    if (config.logFacility === 'stdout') {
      this._logger = createSimpleLogger();
    } else {
      this._logger = createSimpleLogger(config.logFacility);
    }
    this.info = this._logger.info.bind(this._logger);
    this.debug = this._logger.debug.bind(this._logger);
    this.warn = this._logger.warn.bind(this._logger);
    this.error = this._logger.error.bind(this._logger);
  }

  info: Logger['info'];
  debug: Logger['debug'];
  warn: Logger['warn'];
  error: Logger['error'];
}
