import { createBundle } from 'dts-buddy';



await createBundle({
  output: 'types/index.d.ts',
  modules: {
    '@scout9/app': 'src/public.d.ts',
    '@scout9/app/testing-tools': 'src/testing-tools/index.js',
    '@scout9/app/spirits': 'src/testing-tools/spirits.js',
    '@scout9/app/schemas': 'src/schemas.js',
  },
  include: ['src']
});

// @TODO uncomment once we fix public.d.ts auto generation
// import { dirname, resolve } from 'node:path';
// import { fileURLToPath } from 'node:url';
// import generatePublicDts from './generate-public-dts.js';
// const __dirname = dirname(fileURLToPath(import.meta.url));
// const outputFilePath = resolve(__dirname, '../src/public.d.ts');
// await generatePublicDts(outputFilePath);
