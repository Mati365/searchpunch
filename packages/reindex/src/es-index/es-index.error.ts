import { TaggedError } from '@searchpunch/core';

export class EsIndexBulkReindexError extends TaggedError.ofLiteral(
  'EsIndexBulkReindexError',
) {}

export class EsIndexStreamReindexError extends TaggedError.ofLiteral(
  'EsIndexStreamReindexError',
) {}

export class EsIndexSingleReindexError extends TaggedError.ofLiteral(
  'EsIndexSingleReindexError',
) {}
