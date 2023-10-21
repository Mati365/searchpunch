import { pipe, flow } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import type { AbstractLogger } from './abstract-logger.types';
import { nop, rejectFalsyItems, tapTaskEither } from '@searchpunch/core';

type UnsafeErrorMessage = string | Error;

type TaskEitherLoggerAttrs<E, A> = {
  onBefore?: () => string;
  onRight?: (data: A) => string;
  onLeft: (error: E) => UnsafeErrorMessage;
};

export class AbstractFpTsLogger {
  constructor(private readonly logger: AbstractLogger) {}

  logTaskEitherError =
    <E, A>(onLeft: (error: E) => UnsafeErrorMessage) =>
    (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
      pipe(
        task,
        this.logTaskEither({
          onLeft,
        }),
      );

  logTaskEither =
    <E, A>({ onBefore, onRight, onLeft }: TaskEitherLoggerAttrs<E, A>) =>
    (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
      pipe(
        TE.fromIO(onBefore ?? nop),
        TE.chain(() => task),
        tapTaskEither(
          onRight ? flow(onRight, this.logger.info) : nop,
          error => {
            this.tryLogErrorWithStack(onLeft(error))(error);
          },
        ),
      );

  private readonly tryLogErrorWithStack =
    (message: UnsafeErrorMessage) => (error: any) => {
      const mappedMessage = pipe(
        [
          message,
          error && 'originalStack' in error && error.originalStack,
          error && 'stack' in error && error.stack,
        ],
        rejectFalsyItems,
        array => array.join('\n'),
      );

      this.logger.error(mappedMessage);
    };
}
