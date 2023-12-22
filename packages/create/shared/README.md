# create-scout9

Everything you need to build a Scout9 project, powered by [`create-scout9`](https://github.com/Scout9Official/scout9-nodejs/tree/main/packages).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create scout9@latest

# create a new project in my-app
npm create scout9@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you'll need an [API key](https://scout9.com) from your verified account.
