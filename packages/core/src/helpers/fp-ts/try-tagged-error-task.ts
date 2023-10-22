import * as TE from 'fp-ts/TaskEither';

import type * as T from 'fp-ts/Task';
import type { TaggedError } from '../../types';

export const tryTaggedErrorTask =
  <TC extends TaggedError<any>>(TagClass: new (originalStack?: string) => TC) =>
  <R>(task: T.Task<R>): TE.TaskEither<TC, R> =>
    TE.tryCatch(task, (exception: any) => new TagClass(exception.stack));
