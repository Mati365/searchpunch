import type { EsDoc } from '+internal';
import type { CanBePromise, ID } from '@searchpunch/core';

export type EsDbAsyncIdIterator = AsyncIterableIterator<ID[]>;

export type EsIndexDbAdapter<Doc> = {
  createAllEntitiesIdsIterator: () => EsDbAsyncIdIterator;
  findEntities: (ids: ID[]) => CanBePromise<Array<EsDoc<Doc>>>;
};
