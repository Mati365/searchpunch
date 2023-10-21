import type * as es from '@elastic/elasticsearch';
import { PinoLogger, type AbstractLogger } from '@searchpunch/logger';

export type EsMonadicDecoratorOptions = {
  client: es.Client;
  logger?: AbstractLogger;
};

/**
 * EsMonadicDecorator is wrapper over default ES client that
 * wraps every required by framework method in TaskEither.
 */
export class EsMonadicClient {
  private readonly client: es.Client;

  private readonly logger: AbstractLogger;

  constructor(options: EsMonadicDecoratorOptions) {
    this.client = options.client;
    this.logger = options.logger ?? new PinoLogger('EsMonadicDecorator');
  }
}
