import { task as T, either as E } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { TaskEither } from 'fp-ts/TaskEither';

export const tryOrThrow = <E, A>(taskEither: TaskEither<E, A>): T.Task<A> =>
  pipe(
    taskEither,
    T.map(either => {
      if (E.isLeft(either)) {
        throw either.left;
      }

      return either.right;
    }),
  );
