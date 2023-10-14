import type { EsIndexSchema } from './types';

type EsIndexClassFactoryAttrs<N extends string, S extends EsIndexSchema> = {
  indexName: N;
  schema?: S;
};

export const createEsIndexClass = <N extends string, S extends EsIndexSchema>({
  indexName,
}: EsIndexClassFactoryAttrs<N, S>) => {
  // eslint-disable-next-line no-console
  console.info('a', indexName);
};
