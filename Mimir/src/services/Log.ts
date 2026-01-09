import { ConfigService } from './Config.js';
import pino from 'pino';

export class LogService {
  protected _logger: pino.Logger;
  constructor(protected config: ConfigService) {
    if (config.logFacility === 'stdout') {
      this._logger = pino();
    } else {
      this._logger = pino(
        pino.destination({
          dest: config.logFacility,
          sync: false,
          append: true,
          mkdir: true,
        })
      );
    }
    this.info = this._logger.info.bind(this._logger);
    this.debug = this._logger.debug.bind(this._logger);
    this.warn = this._logger.warn.bind(this._logger);
    this.error = this._logger.error.bind(this._logger);
  }

  info: pino.Logger['info'];
  debug: pino.Logger['debug'];
  warn: pino.Logger['warn'];
  error: pino.Logger['error'];
}
