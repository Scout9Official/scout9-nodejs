import polka from 'polka';
import sirv from 'sirv';
import compression from 'compression';
import bodyParser from 'body-parser';
import colors from 'kleur';
import { config as dotenv } from 'dotenv';
import { Configuration, Scout9Api } from '@scout9/admin';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import projectApp from './src/app.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.DEV_MODE === "true" || process.env.TEST_MODE === "true";

class ServerCache {
  constructor(filePath = path.resolve(__dirname, './server.cache.json')) {
    this.filePath = filePath;
    this._load();
  }

  isTested() {
    return this._cache.tested === true;
  }

  setTested(value = true) {
    this._cache.tested = value;
    this._save();
  }

  reset(override = {tested: false}) {
    this._save(override);
    this._cache = override;
  }

  _load() {
    try {
      this._cache = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      return this._cache;
    } catch (e) {
      if (e.code === 'ENOENT') {
        this._save();
      } else {
        throw e;
      }
    }
  }

  _save(override) {
    fs.writeFileSync(this.filePath, JSON.stringify(override || this._cache || {tested: false}, null, 2));
  }
}


// Ensure .env config is set (specifically SCOUT9_API_KEY)
const configFilePath = path.resolve(process.cwd(), './.env');
dotenv({path: configFilePath});

const configuration = new Configuration({
  apiKey: process.env.SCOUT9_API_KEY
});
const scout9 = new Scout9Api(configuration);
const cache = new ServerCache();
cache.reset();




const handleError = (e, res = undefined) => {
  let name = e?.name || 'Runtime Error';
  let message = e?.message || 'Unknown error';
  let code = typeof e?.code === 'number'
    ? e?.code
    : typeof e?.status === 'number'
      ? e?.status
      : 500;
  if ('response' in e) {
    const response = e.response;
    if (response?.status) {
      code = response.status;
    }
    if (response?.statusText) {
      name = response.statusText;
    }
    if (response?.data) {
      message = response.data;
    }
  }
  console.log(colors.red(`${colors.bold(`${code} Error`)}: ${message}`));
  if (res) {
    res.writeHead(code, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      name,
      error: message,
      code
    }));
  }
};

const app = polka();

app.use(bodyParser.json());

if (dev) {
  app.use(compression());
  app.use(sirv(path.resolve(__dirname, 'public'), {dev: true}));
}

// Root application POST endpoint will run the scout9 app
app.post(dev ? '/dev/workflow' : '/', async (req, res) => {
  try {
    // @TODO use zod to check if req.body is a valid event object
    const response = await projectApp(req.body);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(response));
  } catch (e) {
    handleError(e, res);
  }
});


// For local development: parse a message
if (dev) {

  app.get('/dev/config', async (req, res, next) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(config));
    try {
      if (!cache.isTested()) {
        const testableEntities = config.entities.filter(e => e?.definitions?.length > 0 || e?.training?.length > 0);
        if (dev && testableEntities.length > 0) {
          console.log(`${colors.grey(`${colors.cyan('>')} Testing ${colors.bold(colors.white(testableEntities.length))} Entities...`)}`);
          const _res = await scout9.parse({
            message: 'Dummy message to parse',
            language: 'en',
            entities: testableEntities
          });
          cache.setTested();
          console.log(`\t${colors.green(`+ ${testableEntities.length} Entities passed`)}`);
        }
      }
    } catch (e) {
      console.error(e);
      handleError(e);
    }
  });

  app.post('/dev/parse', async (req, res, next) => {
    try {
      // req.body: {message: string}
      const {message, language} = req.body;
      if (typeof message !== 'string') {
        throw new Error('Invalid message - expected to be a string');
      }
      console.log(`${colors.grey(`${colors.cyan('>')} Parsing "${colors.bold(colors.white(message))}`)}"`);
      const payload = await scout9.parse({
        message,
        language: 'en',
        entities: config.entities
      }).then((_res => _res.data));
      let fields = '';
      for (const [key, value] of Object.entries(payload.context)) {
        fields += `\n\t\t${colors.bold(colors.white(key))}: ${colors.grey(JSON.stringify(value))}`;
      }
      console.log(`\tParsed in ${payload.ms}ms:${colors.grey(`${fields}`)}`);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(payload));
    } catch (e) {
      handleError(e, res);
    }
  });

  app.post('/dev/forward', async (req, res, next) => {
    try {
      // req.body: {message: string}
      const {convo} = req.body;
      console.log(`${colors.grey(`${colors.cyan('>')} Forwarding...`)}`);
      const payload = await scout9.forward({convo}).then((_res => _res.data));
      console.log(`\tForwarded in ${payload?.ms}ms`);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(payload));
    } catch (e) {
      handleError(e, res);
    }
  });

  app.post('/dev/generate', async (req, res, next) => {
    try {
      // req.body: {conversation: {}, messages: []}
      const {messages, persona: personaId} = req.body;
      if (typeof messages !== 'object' || !Array.isArray(messages)) {
        throw new Error('Invalid messages array - expected to be an array of objects');
      }
      if (typeof personaId !== 'string') {
        throw new Error('Invalid persona - expected to be a string');
      }
      const persona = (config.persona || config.agents).find(p => p.id === personaId);
      if (!persona) {
        throw new Error(`Could not find persona with id: ${personaId}, ensure your project is sync'd by running "scout9 sync"`);
      }
      console.log(`${colors.grey(`${colors.cyan('>')} Generating ${colors.bold(colors.white(persona.firstName))}'s`)} ${colors.bold(
        colors.red(colors.bgBlack('auto-reply')))}`);
      const payload = await scout9.generate({
        messages,
        persona,
        llm: config.llm,
        pmt: config.pmt
      }).then((_res => _res.data));
      console.log(`\t${colors.grey(`Response: ${colors.green('"')}${colors.bold(colors.white(payload.message))}`)}${colors.green(
        '"')} (elapsed ${payload.ms}ms)`);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(payload));
    } catch (e) {
      handleError(e, res);
    }
  });
}


app.listen(process.env.PORT || 8080, err => {
  if (err) throw err;

  const art_scout9 = `


 ________  ________  ________  ___  ___  _________  ________     
|\\   ____\\|\\   ____\\|\\   __  \\|\\  \\|\\  \\|\\___   ___\\\\  ___  \\    
\\ \\  \\___|\\ \\  \\___|\\ \\  \\|\\  \\ \\  \\\\\\  \\|___ \\  \\_\\ \\____   \\   
 \\ \\_____  \\ \\  \\    \\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\ \\|____|\\  \\  
  \\|____|\\  \\ \\  \\____\\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\    __\\_\\  \\ 
    ____\\_\\  \\ \\_______\\ \\_______\\ \\_______\\   \\ \\__\\  |\\_______\\
   |\\_________\\|_______|\\|_______|\\|_______|    \\|__|  \\|_______|
   \\|_________|                                                  
`;
  const art_auto_reply = `    ___         __           ____             __         __   
   /   | __  __/ /_____     / __ \\___  ____  / /_  __   / /   
  / /| |/ / / / __/ __ \\   / /_/ / _ \\/ __ \\/ / / / /  / /    
 / ___ / /_/ / /_/ /_/ /  / _, _/  __/ /_/ / / /_/ /  /_/     
/_/  |_\\__,_/\\__/\\____/  /_/ |_|\\___/ .___/_/\\__, /  (_)      
                                   /_/      /____/            
  
`
  const protocol = process.env.PROTOCOL || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 8080;
  const fullUrl = `${protocol}://${host}:${port}`;
  if (dev) {
    console.log(colors.bold(colors.green(art_scout9)));
    console.log(colors.bold(colors.cyan(art_auto_reply)));
    console.log(`${colors.grey(`${colors.cyan('>')} Running ${colors.bold(colors.white('Scout9'))}`)} ${colors.bold(colors.red(colors.bgBlack('auto-reply')))} ${colors.grey('dev environment on')} ${fullUrl}`);
  } else {
    console.log(`Running Scout9 auto-reply app on ${fullUrl}`);
  }
  // Run checks
  if (!fs.existsSync(configFilePath)) {
    console.log(colors.red('Missing .env file, your auto reply application may not work without it.'));
  }

  if (!process.env.SCOUT9_API_KEY) {
    console.log(colors.red('Missing SCOUT9_API_KEY environment variable, your auto reply application may not work without it.'));
  }

  if (process.env.SCOUT9_API_KEY === '<insert-scout9-api-key>') {
    console.log(`${colors.red('SCOUT9_API_KEY has not been set in your .env file.')} ${colors.grey('You can find your API key in the Scout9 dashboard.')} ${colors.bold(colors.cyan('https://scout9.com'))}`);
  }

});
