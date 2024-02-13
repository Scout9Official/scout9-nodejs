import { createBundle } from 'dts-buddy';

createBundle({
  output: 'types/index.d.ts',
  modules: {
    '@scout9/app': 'src/public.d.ts',
    '@scout9/app/testing-tools': 'src/testing-tools/index.js',
  },
  include: ['src']
});
