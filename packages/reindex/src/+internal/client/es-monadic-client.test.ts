import { EsMonadicClient } from './es-monadic-client';

test('test', async () => {
  const client = EsMonadicClient.ofConnection({
    node: 'http://localhost:9001',
  });

  await client.alias.getAllIndicesByAlias('dupa')();
});
