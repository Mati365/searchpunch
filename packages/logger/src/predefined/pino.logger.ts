import pino, { type Logger } from 'pino';
import { AbstractLogger, type AbstractLoggerLevel } from '../abstract';

export class PinoLogger extends AbstractLogger {
  readonly logger: Logger;

  constructor(prefix: string) {
    super(prefix);

    this.logger = pino({
      msgPrefix: prefix,
    });
  }

  log(level: AbstractLoggerLevel) {
    return (message: string) => {
      const executor = this.logger[level].bind(this.logger);

      executor(message);
    };
  }
}
