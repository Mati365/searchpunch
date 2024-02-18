import { Queue } from 'async-await-queue';
import { pipe, identity } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import deepEq from 'fast-deep-equal';

import type * as RTE from 'fp-ts/ReaderTaskEither';
import type * as es from '@elastic/elasticsearch';

import { PinoLogger, type AbstractLogger } from '@searchpunch/logger';
import {
  createIndexNameWithTimestamp,
  createIndexSchemaWithMagicMeta,
  tryEsTask,
  getIndexSchemaMagicMeta,
  type EsMonadicClient,
} from '../+internal';

import {
  catchTaskEitherTagErrorTE,
  tapTaskEitherErrorTE,
  delayTaskEither,
  tryOrThrow,
  ValueObject,
  type ID,
} from '@searchpunch/core';

import type {
  EsDbAsyncIdIterator,
  EsIndexDbAdapter,
} from './es-index-db-adapter';

import {
  EsIndexBulkReindexError,
  EsIndexSingleReindexError,
  EsIndexStreamReindexError,
} from './es-index.error';

export type EsIndexSchema = Omit<es.estypes.IndicesCreateRequest, 'index'>;

export type EsIndexProps<Doc> = {
  indexName: string;
  schema: EsIndexSchema;
  client: EsMonadicClient;
  logger?: AbstractLogger;
  dbAdapter: EsIndexDbAdapter<Doc>;
};

export type EsReindexAttrs = {
  waitForRecordsAvailability?: boolean;
};

export class EsIndex<Doc> extends ValueObject<EsIndexProps<Doc>> {
  static readonly HEALTHY_RECORD_WAIT_TIMEOUT = 1000;

  static of<Doc>(props: Readonly<EsIndexProps<Doc>>) {
    return new EsIndex(props);
  }

  private get indexName() {
    return this.props.indexName;
  }

  private get client() {
    return this.props.client;
  }

  private get logger() {
    return this.props.logger ?? new PinoLogger(`EsIndex[${this.indexName}]`);
  }

  synchronize = () =>
    pipe(
      this.ensureIndexExists(),
      TE.chainW(({ created }) =>
        created ? TE.of(true) : this.isIndexSchemaOutOfDate(),
      ),
      TE.chainW(shouldReindex =>
        shouldReindex ? this.reindex.all() : TE.of(undefined),
      ),
      this.logger.fp.logTaskEither({
        onBefore: () => `Trying to synchronize "${this.indexName}" index...`,
        onRight: () => `"${this.indexName}" index has been synchronized!`,
        onLeft: () => `Unable to synchronize "${this.indexName}" index!`,
      }),
    );

  isIndexSchemaOutOfDate = () =>
    pipe(
      this.client.index.getMapping(this.indexName),
      TE.map(
        mappings =>
          !deepEq(
            getIndexSchemaMagicMeta(mappings),
            getIndexSchemaMagicMeta(this.props.schema),
          ),
      ),
    );

  readonly delete = {
    byIds: ({ ids }: { ids: ID[] }) => {
      const serializedIds = ids.join(', ');

      return pipe(
        this.client.record.deleteByIds({ ids, index: this.indexName }),
        this.logger.fp.logTaskEither({
          onBefore: () => `Deleting records (ids: ${serializedIds})...`,
          onRight: () => `Records (ids: ${serializedIds}) deleted!`,
          onLeft: () => `Error during records (ids: ${serializedIds}) delete!`,
        }),
      );
    },

    byId: ({ id }: { id: ID }) =>
      pipe(
        this.client.record.delete({ id, index: this.indexName }),
        this.logger.fp.logTaskEither({
          onBefore: () => `Deleting record (id: ${id})...`,
          onRight: () => `Record (id: ${id}) deleted!`,
          onLeft: () => `Error during record (id: ${id}) delete!`,
        }),
      ),
  };

  readonly reindex = {
    all: ({ waitForRecordsAvailability }: EsReindexAttrs = {}) =>
      pipe(
        this.props.dbAdapter.createAllEntitiesIdsIterator(),
        this.reindex.stream,
        this.executeOnTmpIndexAndSwitchTE,
        waitForRecordsAvailability
          ? delayTaskEither(EsIndex.HEALTHY_RECORD_WAIT_TIMEOUT)
          : identity,
        this.logger.fp.logTaskEither({
          onBefore: () => 'Trying to reindex all records...',
          onRight: () => 'All records reindexed!',
          onLeft: () => 'Error during reindex all!',
        }),
      ),

    stream: (() => {
      const streamReindexQueue = new Queue(1);

      return (stream: EsDbAsyncIdIterator) =>
        (indexName: string = this.indexName) =>
          pipe(
            tryEsTask(EsIndexStreamReindexError)(async () => {
              let offset: number = 0;

              for await (const ids of stream) {
                this.logger.debug(`Indexing offset: ${offset}...`);

                await pipe(
                  this.reindex.byIds({ index: indexName, ids }),
                  tryOrThrow,
                )();

                offset += ids.length;
              }

              return undefined;
            }),
            task => async () => streamReindexQueue.run(task),
          );
    })(),

    byId: ({ id, waitForRecordsAvailability }: EsReindexAttrs & { id: ID }) =>
      pipe(
        async () => {
          const result = await this.props.dbAdapter.findEntities([id]);

          if (!result.length) {
            throw new Error();
          }

          return result[0];
        },
        tryEsTask(EsIndexSingleReindexError),
        waitForRecordsAvailability
          ? delayTaskEither(EsIndex.HEALTHY_RECORD_WAIT_TIMEOUT)
          : identity,
        this.logger.fp.logTaskEither({
          onBefore: () => `Trying to reindex record (id: ${id})...`,
          onRight: () => `Record (id: ${id}) reindexed!`,
          onLeft: () => `Error during record (id: ${id}) reindex!`,
        }),
      ),

    byIds: ({
      waitForRecordsAvailability,
      ids,
      index = this.indexName,
    }: EsReindexAttrs & { ids: ID[]; index?: string }) =>
      pipe(
        async () => this.props.dbAdapter.findEntities(ids),
        tryEsTask(EsIndexBulkReindexError),
        TE.chainW(docs =>
          docs.length
            ? this.client.reindex.bulk({ docs, index })
            : TE.of(undefined),
        ),
        waitForRecordsAvailability
          ? delayTaskEither(EsIndex.HEALTHY_RECORD_WAIT_TIMEOUT)
          : identity,
      ),
  };

  private readonly executeOnTmpIndexAndSwitchTE = <E, A>(
    taskReader: RTE.ReaderTaskEither<string, E, A>,
  ) => {
    const { alias, index } = this.client;

    return pipe(
      this.createTmpIndex(),
      TE.chain(tmpIndex =>
        pipe(
          TE.Do,
          TE.bind('prevIndices', () =>
            alias.getAllIndicesByAlias(this.indexName),
          ),
          TE.bindW('taskResult', () => taskReader(tmpIndex.index)),
          tapTaskEitherErrorTE(() =>
            alias.put({
              aliasName: this.indexName,
              destinationIndex: tmpIndex.index,
            }),
          ),
          tapTaskEitherErrorTE(() => index.delete([tmpIndex.index])),
          TE.chainFirstW(({ prevIndices }) => index.delete(prevIndices)),
          TE.map(({ taskResult }) => taskResult),
        ),
      ),
    );
  };

  private readonly ensureIndexExists = () => {
    const createWithAlias = this.executeOnTmpIndexAndSwitchTE(() =>
      TE.of(undefined),
    );

    return pipe(
      this.client.alias.existsOrFail(this.props.indexName),
      TE.map(() => ({ created: false })),
      catchTaskEitherTagErrorTE('EsNotFound', () =>
        pipe(
          createWithAlias,
          TE.map(() => ({ created: true })),
        ),
      ),
    );
  };

  private readonly createTmpIndex = () =>
    this.client.index.create({
      ...createIndexSchemaWithMagicMeta(this.props.schema),
      index: createIndexNameWithTimestamp(this.indexName),
    });
}
