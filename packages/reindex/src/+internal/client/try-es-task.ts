import { errors } from '@elastic/transport';
import * as TE from 'fp-ts/TaskEither';
import type * as T from 'fp-ts/Task';

import type { TaggedError } from '@searchpunch/core';
import {
  EsConnectionRefused,
  EsInternalError,
} from './es-monadic-client.error';

export const tryEsTask =
  <TC extends TaggedError<any> = EsInternalError>(
    TagClass?: new (originalStack?: string) => TC,
  ) =>
  <R>(
    task: T.Task<R>,
  ): TE.TaskEither<EsConnectionRefused | EsInternalError | TC, R> =>
    TE.tryCatch(task, (exception: any) => {
      if (exception instanceof errors.ConnectionError) {
        return new EsConnectionRefused(exception.stack);
      }

      if (TagClass && exception instanceof errors.ResponseError) {
        return new TagClass(exception.stack);
      }

      return new EsInternalError(exception.stack);
    });
