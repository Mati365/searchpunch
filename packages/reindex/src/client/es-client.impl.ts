import { Effect, Layer } from 'effect';
import { EsClientService } from './es-client.interface';

export const EsClientServiceImpl = Layer.succeed(
  EsClientService,
  EsClientService.of({
    createIndex: () => Effect.sync(() => {}),
    deleteAlias: () => Effect.sync(() => {}),
    deleteIndex: () => Effect.sync(() => {}),
  }),
);
