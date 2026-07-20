import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:8000/openapi.json',
  output: {
    path: 'src/api',
    clean: false, // Do not delete custom files in src/api
  },
  plugins: [
    '@hey-api/client-axios',
    '@hey-api/typescript',
    {
      name: '@hey-api/sdk',
      operations: {
        strategy: 'byTags',
      },
    },
    '@tanstack/react-query',
  ],
});
