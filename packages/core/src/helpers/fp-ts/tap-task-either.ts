import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

export const tapTaskEither =
  <E, A>(onRight: (data: A) => void, onLeft?: (error: E) => void) =>
  (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
    pipe(
      task,
      TE.fold(
        error => {
          onLeft?.(error);
          return TE.left(error);
        },
        data => {
          onRight(data);
          return TE.right(data);
        },
      ),
    );
