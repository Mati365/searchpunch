import { pipe } from 'fp-ts/function';
import * as es from '@elastic/elasticsearch';
import * as esb from 'elastic-builder';

import { PinoLogger, type AbstractLogger } from '@searchpunch/logger';

import type { ID } from '@searchpunch/core';
import type { EsDoc } from './es-monadic-client.types';

import { tryEsTask } from './try-es-task';
import {
  EsBulkReindexError,
  EsNotFoundError,
  EsUnableSetAliasError,
} from './es-monadic-client.error';

export type AttrWithEsIndex<F = unknown> = F & {
  index: string;
};

export type EsMonadicClientOptions = {
  client: es.Client;
  logger?: AbstractLogger;
};

export class EsMonadicClient {
  readonly rawClient: es.Client;

  private readonly logger: AbstractLogger;

  constructor(options: EsMonadicClientOptions) {
    this.rawClient = options.client;
    this.logger = options.logger ?? new PinoLogger('EsMonadicClient');
  }

  static ofConnection = (
    esConnectionOptions: es.ClientOptions,
    options?: Omit<EsMonadicClientOptions, 'client'>,
  ) =>
    new EsMonadicClient({
      ...options,
      client: new es.Client(esConnectionOptions),
    });

  readonly index = {
    getMapping: (index: string) =>
      pipe(async () => {
        const response = await this.rawClient.indices.getMapping({
          index,
        });

        return response.body.mappings;
      }, tryEsTask(EsNotFoundError)),

    delete: (names: string[]) =>
      pipe(
        async () =>
          this.rawClient.indices.delete({
            index: names,
          }),
        tryEsTask(),
        this.logger.fp.logTaskEither({
          onBefore: () => `Trying to delete indices: ${names.join(', ')}!`,
          onLeft: () =>
            `Cannot delete indices with names: ${names.join(', ')}!`,
          onRight: () =>
            `Indices with names ${names.join(', ')} has been deleted!`,
        }),
      ),

    create: (dto: es.estypes.IndicesCreateRequest) =>
      pipe(
        async () => {
          await this.rawClient.indices.create(dto);

          return {
            index: dto.index,
          };
        },
        tryEsTask(),
        this.logger.fp.logTaskEither({
          onBefore: () => `Trying to create index with name "${dto.index}"!`,
          onLeft: () => `Cannot create index with name "${dto.index}"!`,
          onRight: () => `Index with name "${dto.index}" has been created!`,
        }),
      ),
  };

  readonly reindex = {
    bulk: <Doc extends EsDoc<unknown>>({
      index,
      docs,
    }: AttrWithEsIndex<{ docs: Doc[] }>) =>
      pipe(
        async () => {
          await this.rawClient.bulk({
            refresh: true,
            body: docs.flatMap(({ _id, ...doc }) => [
              {
                index: {
                  _index: index,
                  _id: _id.toString(),
                },
              },
              doc,
            ]),
          });
        },
        tryEsTask(EsBulkReindexError),
        this.logger.fp.logTaskEitherError(() => 'Cannot bulk reindex records!'),
      ),
  };

  readonly record = {
    get: ({ id, index }: AttrWithEsIndex<{ id: ID }>) =>
      pipe(
        async () => {
          const response = await this.rawClient.get({
            id: id.toString(),
            index,
          });

          return response._source;
        },
        tryEsTask(EsNotFoundError),
        this.logger.fp.logTaskEitherError(() => `Record with ${id} not found!`),
      ),

    delete: ({ id, index }: AttrWithEsIndex<{ id: ID }>) =>
      pipe(
        async () =>
          this.rawClient.delete({
            id: id.toString(),
            index,
          }),
        tryEsTask(),
        this.logger.fp.logTaskEitherError(() => `Record with ${id} not found!`),
      ),

    deleteByIds: ({ ids, index }: AttrWithEsIndex<{ ids: ID[] }>) =>
      pipe(
        async () => {
          if (!ids.length) {
            return;
          }

          await this.rawClient.deleteByQuery({
            index,
            body: esb
              .requestBodySearch()
              .query(
                esb.termsQuery(
                  'id',
                  ids.map(id => id.toString()),
                ),
              )
              .toJSON(),
          });
        },
        tryEsTask(),
        this.logger.fp.logTaskEitherError(
          () => `Cannot delete records ${ids.join(', ')}!`,
        ),
      ),
  };

  readonly alias = {
    getAllIndicesByAlias: (aliasName: string) =>
      pipe(
        async () => {
          const response = await this.rawClient.indices.getAlias({
            index: aliasName,
          });

          return Object.keys(response.body);
        },
        tryEsTask(),
        this.logger.fp.logTaskEitherError(
          () => `Unable to list "${aliasName}" alias indices!`,
        ),
      ),

    put: (attrs: { aliasName: string; destinationIndex: string }) =>
      pipe(
        async () =>
          this.rawClient.indices.putAlias({
            index: attrs.destinationIndex,
            name: attrs.aliasName,
          }),
        tryEsTask(EsUnableSetAliasError),
        this.logger.fp.logTaskEither({
          onLeft: () => 'Unable to put alias!',
          onBefore: () =>
            `Trying to put alias "${attrs.aliasName}" for "${attrs.destinationIndex}" index!`,
        }),
      ),

    existsOrFail: (name: string) =>
      pipe(
        async () =>
          this.rawClient.indices.existsAlias({
            name,
          }),
        tryEsTask(EsNotFoundError),
        this.logger.fp.logTaskEitherError(
          () => `Cannot check if "${name}" index exists!`,
        ),
      ),
  };
}
