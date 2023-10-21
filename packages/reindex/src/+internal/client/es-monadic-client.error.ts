import { TaggedError } from '@searchpunch/core';

export class EsUnableSetAliasError extends TaggedError {
  readonly tag = 'EsUnableSetAliasError';
}

export class EsNotFoundError extends TaggedError {
  readonly tag = 'EsNotFoundError';
}

export class EsConnectionRefused extends TaggedError {
  readonly tag = 'EsConnectionRefused';
}

export class EsInternalError extends TaggedError {
  readonly tag = 'EsInternalError';
}

export type EsTaggedError =
  | EsConnectionRefused
  | EsUnableSetAliasError
  | EsNotFoundError
  | EsInternalError;
