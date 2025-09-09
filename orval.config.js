// eslint-disable-next-line @typescript-eslint/no-var-requires

const stripApiPrefix = (operation) => {
  // Remove /api/rest/v1 prefix from the URL
  if (operation.path) {
    operation.path = operation.path.replace('/api/rest/v1', '');
  }
  return operation;
};

module.exports = {
  'sumrm-api': {
    input: './open_api.json',
    output: {
      mode: 'split',
      target: './src/shared/api/generated/endpoints.ts',
      schemas: './src/shared/api/generated/models',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: './src/shared/api/customInstance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
        operations: {
          stripApiPrefix,
        },
      },
    },
  },
};

