import type { TaskEither } from 'fp-ts/TaskEither';
import type { TaggedError } from './tagged-error.types';

export type TaggedTaskEither<E extends TaggedError<any>, A> = TaskEither<E, A>;
