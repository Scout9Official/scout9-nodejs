import { Scout9Platform } from './src/platform.js';

(async () => {
    const dest = './tmp/project';
    process.env.DEV_MODE = "true";
    await Scout9Platform.build({cwd: process.cwd(), mode: 'development', src: 'src-test', dest: dest});
    await import(`${process.cwd()}/${dest}/app.js`);
})();
