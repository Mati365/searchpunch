export abstract class TaggedError<T extends string> extends Error {
  abstract readonly tag: T;

  constructor(readonly originalStack?: string) {
    super();
    Error.captureStackTrace(this, TaggedError);
  }

  static ofLiteral = <const S extends string>(tag: S) =>
    class TaggedLiteralError extends TaggedError<S> {
      readonly tag = tag;
    };
}

export const isTaggedError = (error: any): error is TaggedError<any> =>
  error && 'tag' in error;
