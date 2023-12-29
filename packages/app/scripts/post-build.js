import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path, {dirname} from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directory = path.join(__dirname, '../dist');

async function updateRequireStatements(dir) {
  const files = await fsp.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await updateRequireStatements(filePath);
    } else if (path.extname(file.name) === '.cjs') {
      let content = await fsp.readFile(filePath, 'utf8');
      content = content.replace(/require\(["'](.+?)\.js["']\)/g, 'require("$1.cjs")');
      await fsp.writeFile(filePath, content, 'utf8');
    }
  }
}

fs.readdirSync(directory).forEach(file => {
  const filePath = path.join(directory, file);
  if (path.extname(file) === '.js') {
    const newFilePath = path.join(directory, path.basename(file, '.js') + '.cjs');
    fs.renameSync(filePath, newFilePath);
  }
});

(async () => {

  await updateRequireStatements(directory)
})();

