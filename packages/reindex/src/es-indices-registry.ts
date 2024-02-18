import { ValueObject } from '@searchpunch/core';
import type { EsIndex } from './es-index/es-index';

type EsIndicesRegistryProps = {
  indices: Array<EsIndex<any>>;
};

export class EsIndicesRegistry extends ValueObject<EsIndicesRegistryProps> {
  get indices() {
    return this.props.indices;
  }

  register = (index: EsIndex<any>): this =>
    this.extend({
      indices: [...this.indices, index],
    });
}
