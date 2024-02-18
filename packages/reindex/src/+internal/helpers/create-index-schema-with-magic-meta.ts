import hash from 'object-hash';

const MAGIC_ES_SCHEMA_TAG = '@searchpunch/synchronized';

type EsIndexMagicMeta = {
  tag: string;
  schemaVersion: string;
};

const createIndexMagicMeta = (schema: object): EsIndexMagicMeta => ({
  tag: MAGIC_ES_SCHEMA_TAG,
  schemaVersion: hash(schema),
});

export const createIndexSchemaWithMagicMeta = <S extends { mappings?: object }>(
  schema: S,
) => ({
  ...schema,
  mappings: {
    _meta: createIndexMagicMeta(schema),
    ...schema.mappings,
  },
});

export const getIndexSchemaMagicMeta = (
  mappings: any,
): EsIndexMagicMeta | null => {
  const maybeMappings = mappings?._meta;

  if (maybeMappings?.tag === MAGIC_ES_SCHEMA_TAG) {
    return maybeMappings;
  }

  return null;
};
