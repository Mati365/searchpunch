import { pipe, flow, identity } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import type { AbstractLogger } from './abstract-logger.types';
import {
  nop,
  rejectFalsyItems,
  tapTaskEither,
  tapTaskEitherError,
} from '@searchpunch/core';

type UnsafeErrorMessage = string | Error;

type TaskEitherLoggerAttrs<E, A> = {
  onBefore?: () => UnsafeErrorMessage;
  onRight?: (data: A) => UnsafeErrorMessage;
  onLeft: (error: E) => UnsafeErrorMessage;
};

export class AbstractFpTsLogger {
  constructor(private readonly logger: AbstractLogger) {}

  logTaskEitherError =
    <E, A>(onLeft: (error: E) => UnsafeErrorMessage) =>
    (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
      pipe(
        task,
        tapTaskEitherError(error => {
          this.tryLogErrorWithStack(onLeft(error))(error);
        }),
      );

  logBeforeTaskEither =
    <E, A>(onBefore: () => UnsafeErrorMessage) =>
    (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
      pipe(
        TE.fromIO(onBefore ? flow(onBefore, this.logger.info) : nop),
        TE.chain(() => task),
      );

  logTaskEitherSuccess =
    <E, A>(onRight: (data: A) => UnsafeErrorMessage) =>
    (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
      pipe(task, tapTaskEither(flow(onRight, this.logger.info)));

  logTaskEither =
    <E, A>({ onBefore, onRight, onLeft }: TaskEitherLoggerAttrs<E, A>) =>
    (task: TE.TaskEither<E, A>): TE.TaskEither<E, A> =>
      pipe(
        task,
        onBefore ? this.logBeforeTaskEither(onBefore) : identity,
        onLeft ? this.logTaskEitherError(onLeft) : identity,
        onRight ? this.logTaskEitherSuccess(onRight) : identity,
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
