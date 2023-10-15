import { Context } from 'effect';

import type * as es from '@elastic/elasticsearch';
import type { EsClientEffect } from './es-client.types';

export type EsClientServiceI = {
  createIndex: (dto: es.estypes.IndicesCreateRequest) => EsClientEffect<void>;
  deleteIndex: (dto: es.estypes.IndicesDeleteRequest) => EsClientEffect<void>;
  deleteAlias: (
    dto: es.estypes.IndicesDeleteAliasRequest,
  ) => EsClientEffect<void>;
};

export const EsClientService = Context.Tag<EsClientServiceI>();
