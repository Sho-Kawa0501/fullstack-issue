import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './graphql/schema.json',
  documents: ['graphql/**/*.graphql'],
  generates: {
    './src/graphql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;

