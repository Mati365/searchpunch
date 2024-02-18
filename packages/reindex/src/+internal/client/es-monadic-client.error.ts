import { TaggedError } from '@searchpunch/core';

export class EsUnableSetAliasError extends TaggedError.ofLiteral(
  'EsUnableSetAlias',
) {}

export class EsNotFoundError extends TaggedError.ofLiteral('EsNotFound') {}

export class EsBulkReindexError extends TaggedError.ofLiteral(
  'EsCannotBulkReindex',
) {}

export class EsConnectionRefused extends TaggedError.ofLiteral(
  'EsConnectionRefused',
) {}

export class EsInternalError extends TaggedError.ofLiteral('EsInternal') {}

export type EsTaggedError =
  | EsConnectionRefused
  | EsUnableSetAliasError
  | EsNotFoundError
  | EsBulkReindexError
  | EsInternalError;
