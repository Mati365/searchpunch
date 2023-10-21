import type { AbstractLogger } from './abstract-logger.types';

export class AbstractFpTsLogger {
  constructor(private readonly logger: AbstractLogger) {}
}
