import type { ID } from '@searchpunch/core';

export type EsDoc<I> = I & {
  _id: ID;
};
