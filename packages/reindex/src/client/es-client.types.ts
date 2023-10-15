import type { Effect } from 'effect';
import type { EsAnyClientError, EsUnknownError } from './es-client.errors';

export type EsClientEffect<
  R,
  E extends EsAnyClientError = EsUnknownError,
> = Effect.Effect<never, E, R>;
