import * as TE from 'fp-ts/TaskEither';
import { timeout } from '../timeout';

export const timeoutTE = (ms: number) => TE.fromTask(async () => timeout(ms));

export const delayTaskEither =
  <TE>(time: number) =>
  (task: TE): TE =>
    TE.chainFirst(() => async () => {
      await timeout(time);
      return TE.of(undefined) as any;
    })(task as any) as TE;
