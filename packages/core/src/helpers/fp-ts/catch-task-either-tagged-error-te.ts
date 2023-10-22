import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import type * as RTE from 'fp-ts/ReaderTaskEither';
import { isTaggedError, type TaggedError } from '../../types';

export const catchTaskEitherTagErrorTE =
  <const T extends string, E2, B>(
    tag: T,
    catchTask: RTE.ReaderTaskEither<TaggedError<T>, E2, B>,
  ) =>
  <E, A>(
    task: TE.TaskEither<E & TaggedError<T> extends never ? never : E, A>,
  ) =>
    pipe(
      task,
      TE.foldW((error): TE.TaskEither<E | E2, A | B> => {
        if (isTaggedError(error) && error.tag === tag) {
          return catchTask(error);
        }

        return TE.left(error);
      }, TE.of),
    ) as TE.TaskEither<E | E2, A | B>;
