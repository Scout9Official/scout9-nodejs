import polka from 'polka';
import sirv from 'sirv';
import compression from 'compression';
import bodyParser from 'body-parser';
import colors from 'kleur';
import { config as dotenv } from 'dotenv';
import { Configuration, Scout9Api } from '@scout9/admin';
import { EventResponse } from '@scout9/app';
import { WorkflowEventSchema, WorkflowResponseSchema } from '@scout9/app/schemas';
import path, { resolve } from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import { fileURLToPath, pathToFileURL } from 'node:url';
import projectApp from './src/app.js';
import config from './config.js';
import { readdir } from 'fs/promises';
import { ZodError } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.DEV_MODE === 'true' || process.env.TEST_MODE === 'true';

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
    fs.writeFileSync(this.filePath, JSON.stringify(override || this._cache || {tested: false}));
  }
}


// Ensure .env config is set (specifically SCOUT9_API_KEY)
const configFilePath = path.resolve(process.cwd(), './.env');
dotenv({path: configFilePath});

const configuration = new Configuration({
  apiKey: process.env.SCOUT9_API_KEY || ''
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
    } else if (response?.body) {
      message = response.body;
    }
  }
  console.log(colors.red(`${colors.bold(`${code} Error`)}: ${message}`));
  if ('stack' in e) {
    console.log(colors.grey(e.stack));
  }
  console.log(colors);
  if (res) {
    res.writeHead(code, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      name,
      error: message,
      code
    }));
  }
};

const handleZodError = ({error, res = undefined, code = 500, status, name, bodyLabel = 'Provided Input', body = undefined, action = ''}) => {
  res?.writeHead?.(code, {'Content-Type': 'application/json'});
  if (error instanceof ZodError) {
    const formattedErrors = JSON.stringify(error.errors, null, 2);
    res?.end?.(JSON.stringify({
      status,
      errors: formattedErrors
    }));
    console.log(colors.red(`${colors.bold(`${name}`)}:`));
    if (body) {
      console.log(colors.grey(`${bodyLabel}:`));
      console.log(colors.grey(JSON.stringify(body, null, 2)));
    }
    console.log(colors.red(`${action}${formattedErrors}`));
  } else {
    console.error(error);
    error.message = `${name}: ` + error.message;
    res?.end?.(JSON.stringify({
      status,
      errors: [error.message]
    }));
    throw new Error(`${name}: Provided error was not a ZodError`);
  }
};

const makeRequest = async (options, maxRedirects = 10) => {
  return new Promise((resolve, reject) => {

    if (maxRedirects < 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const req = https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect
        console.log(`Redirecting to ${res.headers.location}`);
        const newUrl = new URL(res.headers.location);
        const newOptions = {
          hostname: newUrl.hostname,
          port: newUrl.port || 443,
          path: newUrl.pathname,
          method: 'GET', // Usually redirects are GET, adjust if necessary
          headers: options.headers // Reuse original headers
          // Add any other necessary options here
        };
        // Recursive call to handle redirect
        resolve(makeRequest(newOptions, maxRedirects - 1));
      } else {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();

  });
};


const app = polka();

app.use(bodyParser.json());

if (dev) {
  app.use(compression());
  app.use(sirv(path.resolve(__dirname, 'public'), {dev: true}));
}

// Root application POST endpoint will run the scout9 app
app.post(dev ? '/dev/workflow' : '/', async (req, res) => {
  let workflowEvent;

  try {
    workflowEvent = WorkflowEventSchema.parse(req.body.event);
    globalThis.SCOUT9 = {
      ...workflowEvent,
      $convo: req.body.$convo
    };
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError({
        error,
        name: 'Workflow Template Event Request Parse Error',
        body: req.body.event,
        bodyLabel: 'Provided WorkflowEvent',
        code: 400,
        res,
        status: 'Invalid WorkflowEvent Input'
      });
    } else {
      error.message = `Workflow Template Event Parse Error: ` + error.message;
      handleError(error, res);
    }
    return;
  }

  if (!workflowEvent) {
    handleError(new Error('No workflowEvent defined'), res);
  }
  let response;
  try {
    response = await projectApp(workflowEvent);
  } catch (error) {
    error.message = `Workflow Template Runtime Error: ` + error.message;
    handleError(error, res);
    return;
  }

  if (!response) {
    throw new Error('No response');
  }

  try {
    const formattedResponse = WorkflowResponseSchema.parse(response);
    if (dev) {
      console.log(colors.green(`Workflow Sending Response:`));
      console.log(colors.grey(JSON.stringify(formattedResponse, null, 2)));
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(formattedResponse));
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError({
        error,
        name: 'Workflow Template Event Response Parse Error',
        body: response,
        bodyLabel: 'Provided WorkflowResponse',
        code: 500,
        res,
        status: 'Invalid WorkflowResponse Output'
      });
    } else {
      error.message = `Workflow Template Runtime Parse Error: ` + error.message;
      handleError(error, res);
    }
  }
});

function isSurroundedByBrackets(str) {
  return /^\[.*\]$/.test(str);
}

function resolveEntity(entity, method) {
  const entityField = config.entities.find(e => e.entity === entity);
  if (!entityField) {
    console.error(`Invalid entity: "${entity}" not found within [${config.entities.map(e => e.entity).join(', ')}]`);
    throw new Error(`Invalid entity: not found`);
  }
  const {api, entities} = entityField;
  if (!api && !api[method]) {
    throw new Error(`Invalid entity: no API`);
  }
  if (!entities) {
    throw new Error(`Invalid entity: no path`);
  }
  return entityField;
}

async function resolveEntityApi(entity, method) {
  const paramEntity = isSurroundedByBrackets(entity);
  if (method === 'GET' && !paramEntity) {
    method = 'QUERY';
  }
  const methods = ['GET', 'UPDATE', 'QUERY', 'PUT', 'PATCH', 'DELETE'];
  if (!methods.includes(method)) {
    throw new Error(`Invalid method: ${method}`);
  }
  const {api, entities} = resolveEntity(entity, method);
  const mod = await import(pathToFileURL(path.resolve(__dirname, `./src/entities/${entities.join('/')}/api.js`)).href)
    .catch((e) => {
      switch (e.code) {
        case 'ERR_MODULE_NOT_FOUND':
        case 'MODULE_NOT_FOUND':
          console.error(e);
          throw new Error(`Invalid entity: no API method`);
        default:
          console.error(e);
          throw new Error(`Invalid entity: Internal system error`);
      }
    });
  if (mod[method]) {
    return mod[method];
  }

  if (method === 'QUERY' && mod['GET']) {
    return mod['GET'];
  }

  throw new Error(`Invalid entity: no API method`);

}


function extractParamsFromPath(path) {
  const segments = path.split('/').filter(Boolean); // Split and remove empty segments
  let params = {};
  const dataStructure = config.entities;

  // Assuming the structure starts with "/entity/"
  segments.shift(); // remove the "entity" segment

  let lastEntity;
  let lastSegment;
  segments.forEach(segment => {
    const isEntity = dataStructure.some(d => d.entity === segment || d.entity === `[${segment}]`);
    if (isEntity) {
      lastEntity = segment;
      lastSegment = segment;
    } else if (lastEntity) {
      const entityDefinition = dataStructure.find(d => {
        const index = d.entities.indexOf(lastEntity);
        return index > -1 && index === (d.entities.length - 2);
      });
      if (entityDefinition) {
        const paramName = entityDefinition.entity.replace(/[\[\]]/g, ''); // Remove brackets to get the param name
        params[paramName] = segment;
        lastSegment = entityDefinition.entity;
      }
      lastEntity = null; // Reset for next potential entity-instance pair
    }
  });

  return {params, lastEntity, lastSegment};
}

async function runEntityApi(req, res) {
  try {
    // polka doesn't support wildcards
    const {params, lastSegment} = extractParamsFromPath(req.url);
    const api = await resolveEntityApi(lastSegment, req.method.toUpperCase());
    const response = await api({
      params,
      searchParams: req?.query || {}, body: req?.body || undefined,
      id: params.id
    });
    if (response instanceof EventResponse || !!response.body) {
      const data = response.body ?? response.data();
      res.writeHead(response.status || 200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(data));
      console.log(`${req.method} EntityApi.${params.id}:`);
      console.log(colors.grey(JSON.stringify(data)));
    } else {
      throw new Error(`Invalid response: not an EventResponse`);
    }
  } catch (e) {
    console.error(`${req.method} EntityApi Runtime Error`, e.message);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: e.message}));
  }
}

async function getFilesRecursive(dir) {
  let results = [];
  const list = await readdir(dir, {withFileTypes: true});

  for (const dirent of list) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(await getFilesRecursive(res)); // Recursively get files from subdirectories
    } else {
      results.push(res); // Add file to results
    }
  }

  return results;
}

async function runCommandApi(req, res) {
  let file;
  const {body, url} = req;
  const params = url.split('/').slice(2).filter(Boolean);
  const commandsDir = resolve(__dirname, `./src/commands`);

  try {
    const files = await getFilesRecursive(commandsDir).then(files => files.map(file => file.replace(commandsDir, '.'))
      .filter(file => params.every(p => file.includes(p))));
    file = files?.[0];
  } catch (e) {
    console.log('No commands found', e.message);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `No commands found`}));
    return;
  }

  if (!file) {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Unable to find command for ${url}`}));
    return;
  }

  let mod;
  try {
    mod = await import(pathToFileURL(path.resolve(commandsDir, file)).href);
  } catch (e) {
    if ('code' in e) {
      switch (e.code) {
        case 'ERR_MODULE_NOT_FOUND':
        case 'MODULE_NOT_FOUND':
          console.error(e);
          res.writeHead(404, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: `Invalid command: no API method found`}));
          return;
      }
    }
    console.error(e);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Invalid command: Internal system error: ${e?.message ?? ''}`}));
    return;
  }

  if (!mod || !mod.default) {
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Command file "${file}" does not export a default command function`}));
    return;
  }

  let result;

  try {
    result = await mod.default(body);
  } catch (e) {
    console.error('Failed to run command', e);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Failed to run command: ${e.message}`}));
    return;
  }

  let responseBody = {};
  let code = 500;
  if (result) {
    if (typeof result === 'string') {
      responseBody = {message: result};
      code = 200;
    } else if (typeof result === 'object' && 'message' in result) {
      responseBody = result;
      code = 200;
    } else {
      responseBody.error = `Invalid Command Response, must either return a string or {"message": "<your message>"}`;
    }
  } else {
    responseBody.error = `No command response provided`;
  }

  res.writeHead(code, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(responseBody));
}

app.post('/commands/:command', runCommandApi);
app.post('/commands/:command/*', runCommandApi);
app.get('/entity/:entity', runEntityApi);
app.put('/entity/:entity', runEntityApi);
app.patch('/entity/:entity', runEntityApi);
app.post('/entity/:entity', runEntityApi);
app.delete('/entity/:entity', runEntityApi);
app.get('/entity/:entity/*', runEntityApi);
app.put('/entity/:entity/*', runEntityApi);
app.patch('/entity/:entity/*', runEntityApi);
app.post('/entity/:entity/*', runEntityApi);
app.delete('/entity/:entity/*', runEntityApi);

// For local development: parse a message
if (dev) {

  app.get('/dev/config', async (req, res, next) => {

    // Retrieve auth token
    const {token, id} = await makeRequest({
      hostname: 'us-central1-jumpstart.cloudfunctions.net',
      port: 443,
      path: '/v1-utils-platform-token',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.SCOUT9_API_KEY
      }
    });
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({token, id, ...config}));
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
      console.log(`\tParsed in ${payload.ms}ms:${colors.grey(`${fields}`)}:`);
      console.log(colors.grey(JSON.stringify(payload)));
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
  
`;
  const protocol = process.env.PROTOCOL || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 8080;
  const fullUrl = `${protocol}://${host}:${port}`;
  if (dev) {
    console.log(colors.bold(colors.green(art_scout9)));
    console.log(colors.bold(colors.cyan(art_auto_reply)));
    console.log(`${colors.grey(`${colors.cyan('>')} Running ${colors.bold(colors.white('Scout9'))}`)} ${colors.bold(
      colors.red(colors.bgBlack('auto-reply')))} ${colors.grey('dev environment on')} ${fullUrl}`);
  } else {
    console.log(`Running Scout9 auto-reply app on ${fullUrl}`);
  }
  // Run checks
  if (!fs.existsSync(configFilePath)) {
    console.log(colors.red('Missing .env file, your auto reply application may not work without it.'));
  }

  if (dev && !process.env.SCOUT9_API_KEY) {
    console.log(colors.red(
      'Missing SCOUT9_API_KEY environment variable, your auto reply application may not work without it.'));
  }

  if (process.env.SCOUT9_API_KEY === '<insert-scout9-api-key>') {
    console.log(`${colors.red('SCOUT9_API_KEY has not been set in your .env file.')} ${colors.grey(
      'You can find your API key in the Scout9 dashboard.')} ${colors.bold(colors.cyan('https://scout9.com'))}`);
  }

});
