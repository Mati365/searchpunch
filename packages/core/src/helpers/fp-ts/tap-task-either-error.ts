import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

export const tapTaskEitherError =
  <E, A>(fn: (data: E) => void) =>
  (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
    pipe(
      task,
      TE.fold(
        error => {
          fn(error);
          return TE.left(error);
        },
        data => TE.right(data),
      ),
    );
