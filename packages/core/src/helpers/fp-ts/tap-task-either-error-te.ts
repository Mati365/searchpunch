import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

export const tapTaskEitherErrorTE =
  <A, E, E2 = E>(errorFnTE: (error: E) => TE.TaskEither<E2, unknown>) =>
  (task: TE.TaskEither<E, A>): TE.TaskEither<E | E2, A> =>
    pipe(
      task,
      TE.foldW(
        error =>
          pipe(
            error,
            errorFnTE,
            TE.foldW(
              rollbackError => TE.left(rollbackError),
              () => TE.left(error),
            ),
          ),
        TE.right,
      ),
    );
