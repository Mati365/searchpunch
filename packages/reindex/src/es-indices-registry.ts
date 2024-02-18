import { ValueObject } from '@searchpunch/core';
import type { EsIndex } from './es-index';

type EsIndicesRegistryProps = {
  indices: EsIndex[];
};

export class EsIndicesRegistry extends ValueObject<EsIndicesRegistryProps> {
  get indices() {
    return this.props.indices;
  }

  register = (index: EsIndex): this =>
    this.extend({
      indices: [...this.indices, index],
    });
}
