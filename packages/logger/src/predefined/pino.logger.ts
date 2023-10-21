import pino, { type Logger } from 'pino';
import pretty from 'pino-pretty';

import { AbstractLogger, type AbstractLoggerLevel } from '../abstract';

export class PinoLogger extends AbstractLogger {
  readonly logger: Logger;

  constructor(prefix: string) {
    super(prefix);

    this.logger = pino(
      {
        msgPrefix: prefix,
      },
      pretty({
        colorize: true,
      }),
    );
  }

  log(level: AbstractLoggerLevel) {
    return (message: string) => {
      const executor = this.logger[level].bind(this.logger);

      executor(message);
    };
  }
}
