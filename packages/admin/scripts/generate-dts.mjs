import { createBundle } from 'dts-buddy';

createBundle({
  output: 'build/index.d.ts',
  modules: {
    '@scout9/admin': 'src/index.ts',
  },
  include: ['src']
})
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
