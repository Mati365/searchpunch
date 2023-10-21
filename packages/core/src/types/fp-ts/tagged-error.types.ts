export abstract class TaggedError extends Error {
  abstract readonly tag: string;

  constructor(readonly originalStack?: string) {
    super();
    Error.captureStackTrace(this, TaggedError);
  }
}

export const isTaggedError = (error: Error): error is TaggedError =>
  'tag' in error;
