import { pipe, flow } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import type * as RTE from 'fp-ts/ReaderTaskEither';
import type * as es from '@elastic/elasticsearch';

import { PinoLogger, type AbstractLogger } from '@searchpunch/logger';
import {
  createIndexNameWithTimestamp,
  createIndexSchemaWithMagicMeta,
  type EsMonadicClient,
} from './+internal';

import {
  ValueObject,
  catchTaskEitherTagErrorTE,
  tapTaskEitherErrorTE,
} from '@searchpunch/core';

type EsIndexSchema = Omit<es.estypes.IndicesCreateRequest, 'index'>;

type EsIndexProps = {
  indexName: string;
  schema: EsIndexSchema;
  client: EsMonadicClient;
  logger?: AbstractLogger;
};

export class EsIndex extends ValueObject<EsIndexProps> {
  get indexName() {
    return this.props.indexName;
  }

  get client() {
    return this.props.client;
  }

  get schema() {
    return this.props.schema;
  }

  get logger() {
    return this.props.logger ?? new PinoLogger('EsIndex');
  }

  synchronize = () =>
    flow(
      this.ensureAliasExists,
      this.logger.fp.logTaskEither({
        onBefore: () => `Trying to synchronize "${this.indexName}" index...`,
        onRight: () => `"${this.indexName}" index has been synchronized!`,
        onLeft: () => `Unable to synchronize "${this.indexName}" index!`,
      }),
    );

  private readonly ensureAliasExists = () => {
    const createWithAlias = this.executeOnTmpIndexAndSwitchTE(() =>
      TE.of(undefined),
    );

    return pipe(
      this.client.alias.existsOrFail(this.props.indexName),
      catchTaskEitherTagErrorTE('EsNotFound', () => createWithAlias),
    );
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

  private readonly createTmpIndex = () =>
    this.client.index.create({
      ...createIndexSchemaWithMagicMeta(this.schema),
      index: createIndexNameWithTimestamp(this.indexName),
    });
}
