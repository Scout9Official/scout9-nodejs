import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  // input: ['./src/index.js', './src/testing-tools/index.js'], // Your main JS file
  input: {
    index: './src/index.js',
    'testing-tools': './src/testing-tools/index.js',
    spirits: './src/testing-tools/spirits.js',
    schemas: './src/schemas.js'
  },
  output: {
    dir: 'dist',
    format: 'cjs', // Bundle format: 'iife' for browser, 'cjs' for Node, etc.
    entryFileNames: '[name].js'
  },
  plugins: [
    resolve(), // Resolves node modules
    commonjs(), // Converts CommonJS modules to ES6
    json(),
    babel({
      exclude: 'node_modules/**' // Exclude node_modules from Babel
    })
  ]
};
