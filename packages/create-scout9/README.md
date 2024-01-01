# create-svelte

A CLI for creating new [Scout9](https://scout9.com) auto reply projects. Just run...

```bash
npm create scout9@latest my-app
```

...and follow the prompts.

## API

You can also use `create-scout9` programmatically:

```js
import { create } from 'create-scout9';

await create('my-new-app', {
  name: 'my-new-app',
  template: 'default', // or 'skeleton'
  // types: 'checkjs', // or 'typescript' or null; // @TODO TypeScript support
  prettier: false,
  eslint: false,
  jest: false
});
```

`checkjs` means your project will use TypeScript to typecheck JavaScript via [JSDoc comments](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).

**_Note_**: *Typescript support will be available soon.*

## License

[MIT](../../LICENSE).
