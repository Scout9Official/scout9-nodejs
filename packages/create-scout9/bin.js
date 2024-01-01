#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import { bold, cyan, grey, yellow, green, magenta } from 'kleur/colors';
import { create } from './index.js';
import { dist, package_manager } from './utils.js';

const { version } = JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8'));
let cwd = process.argv[2] || '.';

console.log(`${grey(`create-scout9 version ${version}`)}`);

p.intro('Welcome to Scout9!');

if (cwd === '.') {
  const dir = await p.text({
    message: 'Where should we create your project?',
    placeholder: '  (hit Enter to use current directory)'
  });

  if (p.isCancel(dir)) process.exit(1);

  if (dir) {
    cwd = /** @type {string} */ (dir);
  }
}

if (fs.existsSync(cwd)) {
  if (fs.readdirSync(cwd).length > 0) {
    const force = await p.confirm({
      message: 'Directory not empty. Continue?',
      initialValue: false
    });

    // bail if `force` is `false` or the user cancelled with Ctrl-C
    if (force !== true) {
      process.exit(1);
    }
  }
}

const options = await p.group(
  {
    template: () =>
      p.select({
        message: 'Which Scout9 app template?',
        // @ts-expect-error i have no idea what is going on here
        options: fs.readdirSync(dist('templates')).map((dir) => {
          const meta_file = dist(`templates/${dir}/meta.json`);
          const { title, description } = JSON.parse(fs.readFileSync(meta_file, 'utf8'));

          return {
            label: title,
            hint: description,
            value: dir
          };
        })
      }),

    // types: () =>
    //   p.select({
    //     message: 'Add type checking with TypeScript?',
    //     initialValue: /** @type {'checkjs' | 'typescript' | null} */ (null),
    //     options: [
    //       {
    //         label: 'Yes, using JavaScript with JSDoc comments',
    //         value: 'checkjs'
    //       },
    //       {
    //         label: 'Yes, using TypeScript syntax',
    //         value: 'typescript'
    //       },
    //       { label: 'No', value: null }
    //     ]
    //   }),

    features: () =>
      p.multiselect({
        message: 'Select additional options (use arrow keys/space bar)',
        required: false,
        options: [
          {
            value: 'eslint',
            label: 'Add ESLint for code linting'
          },
          {
            value: 'prettier',
            label: 'Add Prettier for code formatting'
          },
          {
            value: 'jest',
            label: 'Add jest for unit testing'
          }
        ]
      })
  },
  { onCancel: () => process.exit(1) }
);

await create(cwd, {
  name: path.basename(path.resolve(cwd)),
  template: /** @type {'default' | 'skeleton' | 'skeletonlib'} */ (options.template),
  // types: options.types,
  types: null,
  prettier: options.features.includes('prettier'),
  eslint: options.features.includes('eslint'),
  jest: options.features.includes('jest'),
});

p.outro('Your project is ready!');

if (options.types === 'typescript') {
  console.log(bold('✔ Typescript'));
} else if (options.types === 'checkjs') {
  console.log(bold('✔ Type-checked JavaScript'));
  console.log(cyan('  https://www.typescriptlang.org/tsconfig#checkJs\n'));
} else if (options.template === 'skeletonlib') {
  const warning = yellow('▲');
  console.log(
    `${warning} You chose to not add type checking, but TypeScript will still be installed in order to generate type definitions when building the library\n`
  );
}

if (options.features.includes('eslint')) {
  console.log(bold('✔ ESLint'));
}

if (options.features.includes('prettier')) {
  console.log(bold('✔ Prettier'));
  console.log(cyan('  https://prettier.io/docs/en/options.html'));
  console.log(cyan('  https://github.com/sveltejs/prettier-plugin-svelte#options\n'));
}

if (options.features.includes('jest')) {
  console.log(bold('✔ jest'));
  console.log(cyan('  https://jest.dev\n'));
}

// @TODO
// console.log('Install community-maintained integrations:');

console.log('\nNext steps:');
let i = 1;

const relative = path.relative(process.cwd(), cwd);
if (relative !== '') {
  console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`);
}

console.log(`  ${i++}: ${bold(cyan(`${package_manager} install`))}`);
// prettier-ignore
console.log(`  ${i++}: ${bold(cyan('git init && git add -A && git commit -m "Initial commit"'))} (optional)`);
console.log(`  ${i++}: ${bold(magenta('Add your SCOUT9_API_KEY to .env'))} (login for api key: https://scout9.com/b)`);
// console.log(`  ${i++}: ${bold(cyan(`${package_manager} run dev`))}`);
console.log(`  ${i++}: ${bold(cyan(`${package_manager} run dev -- --open`))}`);

// console.log(`\nTo close the dev server, hit ${bold(cyan('Ctrl-C'))}`);
console.log(`\nStuck? Connect with us on ${bold('Discord')} ${cyan('https://discord.gg/kG8hZwc5sQ')}`);
console.log(`\nYour api key is listed on your ${bold('Scout9')} account ${cyan('https://scout9.com/b')} page`);
