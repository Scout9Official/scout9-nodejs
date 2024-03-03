import { Scout9Platform } from './src/platform.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';


(async () => {
    const dest = './tmp/project';
    process.env.DEV_MODE = "true";
    await Scout9Platform.deploy({cwd: process.cwd(), mode: 'development', src: 'src-test', dest: dest});

    // const modulePath = fileURLToPath(import.meta.url);
    // const cwd = path.dirname(modulePath);
    // const filePath = path.join(cwd, dest, 'app.js');
    // await import(pathToFileURL(filePath));
    // await import(`${process.cwd()}/${dest}/app.js`);
})();
